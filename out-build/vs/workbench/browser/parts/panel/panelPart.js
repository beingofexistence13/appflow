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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/panel/panelPart", "vs/base/common/actions", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/common/contextkeys", "vs/workbench/browser/parts/compositePart", "vs/workbench/services/layout/browser/layoutService", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/panel/panelActions", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/compositeBar", "vs/workbench/browser/parts/compositeBarActions", "vs/platform/notification/common/notification", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/extensions/common/extensions", "vs/workbench/common/views", "vs/workbench/browser/dnd", "vs/workbench/browser/panecomposite", "vs/workbench/browser/actions", "vs/platform/actions/common/actions", "vs/base/common/hash", "vs/base/common/uri", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/activitybar/activitybarActions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/css!./media/basepanelpart", "vs/css!./media/panelpart"], function (require, exports, nls_1, actions_1, event_1, platform_1, actionbar_1, contextkeys_1, compositePart_1, layoutService_1, storage_1, contextView_1, telemetry_1, keybinding_1, instantiation_1, panelActions_1, themeService_1, themables_1, theme_1, colorRegistry_1, compositeBar_1, compositeBarActions_1, notification_1, dom_1, lifecycle_1, contextkey_1, types_1, extensions_1, views_1, dnd_1, panecomposite_1, actions_2, actions_3, hash_1, uri_1, toolbar_1, commands_1, activitybarActions_1, menuEntryActionViewItem_1) {
    "use strict";
    var $6xb_1, $7xb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7xb = exports.$6xb = void 0;
    let $6xb = class $6xb extends compositePart_1.$5xb {
        static { $6xb_1 = this; }
        static { this.Fb = 50; }
        get snap() {
            // Always allow snapping closed
            // Only allow dragging open if the panel contains view containers
            return this.u.isVisible(this.Ub) || this.Gb.getVisibleComposites().length > 0;
        }
        get preferredHeight() {
            // Don't worry about titlebar or statusbar visibility
            // The difference is minimal and keeps this function clean
            return this.u.dimension.height * 0.4;
        }
        get preferredWidth() {
            const activeComposite = this.getActivePaneComposite();
            if (!activeComposite) {
                return;
            }
            const width = activeComposite.getOptimalWidth();
            if (typeof width !== 'number') {
                return;
            }
            return Math.max(width, 300);
        }
        //#endregion
        get onDidPaneCompositeOpen() { return event_1.Event.map(this.a.event, compositeEvent => compositeEvent.composite); }
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, Rb, Sb, Tb, Ub, activePanelSettingsKey, Vb, Wb, panelRegistryId, Xb, Yb, Zb, $b, ac) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, platform_1.$8m.as(panelRegistryId), activePanelSettingsKey, Rb.getDefaultViewContainer(Yb)?.id || '', 'panel', 'panel', undefined, Ub, ac);
            this.Rb = Rb;
            this.Sb = Sb;
            this.Tb = Tb;
            this.Ub = Ub;
            this.Vb = Vb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            //#region IView
            this.minimumWidth = 300;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 77;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.onDidPaneCompositeClose = this.b.event;
            this.Hb = new Map();
            this.Kb = new Map();
            this.Lb = false;
            this.Nb = false;
            this.Qb = new Map();
            this.Ob = platform_1.$8m.as(panelRegistryId);
            this.Pb = new compositeBar_1.$Zxb(this.Rb, this.Yb, (id, focus) => this.openPaneComposite(id, focus).then(panel => panel || null), (from, to, before) => this.Gb.move(from, to, before?.horizontallyBefore), () => this.Gb.getCompositeBarItems());
            this.Gb = this.B(this.hb.createInstance(compositeBar_1.$1xb, this.Dc(), {
                icon: !!this.ac.useIcons,
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                activityHoverOptions: this.bc(),
                openComposite: (compositeId, preserveFocus) => this.openPaneComposite(compositeId, !preserveFocus).then(panel => panel || null),
                getActivityAction: compositeId => this.yc(compositeId).activityAction,
                getCompositePinnedAction: compositeId => this.yc(compositeId).pinnedAction,
                getCompositeBadgeAction: compositeId => this.yc(compositeId).badgeAction,
                getOnCompositeClickAction: compositeId => this.hb.createInstance(panelActions_1.$Ktb, (0, types_1.$uf)(this.getPaneComposite(compositeId)), this.Yb),
                fillExtraContextMenuActions: actions => this.cc(actions),
                getContextMenuActionsForComposite: compositeId => this.dc(compositeId),
                getDefaultCompositeId: () => Rb.getDefaultViewContainer(this.Yb)?.id,
                hidePart: () => this.u.setPartHidden(true, this.Ub),
                dndHandler: this.Pb,
                compositeSize: 0,
                overflowActionSize: 44,
                colors: theme => ({
                    activeBackgroundColor: theme.getColor(this.Xb),
                    inactiveBackgroundColor: theme.getColor(this.Xb),
                    activeBorderBottomColor: theme.getColor(theme_1.$P_),
                    activeForegroundColor: theme.getColor(theme_1.$N_),
                    inactiveForegroundColor: theme.getColor(theme_1.$O_),
                    badgeBackground: theme.getColor(colorRegistry_1.$dw),
                    badgeForeground: theme.getColor(colorRegistry_1.$ew),
                    dragAndDropBorder: theme.getColor(theme_1.$R_)
                })
            }));
            this.kc();
            this.ec([...this.getPaneComposites()]);
            // Global Panel Actions
            this.Jb = this.B(this.hb.createInstance(actions_2.$qeb, Ub === "workbench.parts.panel" /* Parts.PANEL_PART */ ? actions_3.$Ru.PanelTitle : actions_3.$Ru.AuxiliaryBarTitle, undefined, undefined));
            this.B(this.Jb.onDidChange(() => this.xc()));
        }
        dc(compositeId) {
            const result = [];
            const viewContainer = this.Rb.getViewContainerById(compositeId);
            const defaultLocation = this.Rb.getDefaultViewContainerLocation(viewContainer);
            if (defaultLocation !== this.Rb.getViewContainerLocation(viewContainer)) {
                result.push((0, actions_1.$li)({ id: 'resetLocationAction', label: (0, nls_1.localize)(0, null), run: () => this.Rb.moveViewContainerToLocation(viewContainer, defaultLocation) }));
            }
            else {
                const viewContainerModel = this.Rb.getViewContainerModel(viewContainer);
                if (viewContainerModel.allViewDescriptors.length === 1) {
                    const viewToReset = viewContainerModel.allViewDescriptors[0];
                    const defaultContainer = this.Rb.getDefaultContainerById(viewToReset.id);
                    if (defaultContainer !== viewContainer) {
                        result.push((0, actions_1.$li)({ id: 'resetLocationAction', label: (0, nls_1.localize)(1, null), run: () => this.Rb.moveViewsToContainer([viewToReset], defaultContainer) }));
                    }
                }
            }
            return result;
        }
        ec(panels) {
            const cachedPanels = this.Dc();
            for (const panel of panels) {
                const cachedPanel = cachedPanels.filter(({ id }) => id === panel.id)[0];
                const activePanel = this.getActivePaneComposite();
                const isActive = activePanel?.getId() === panel.id ||
                    (this.Nb && this.Gb.getVisibleComposites().length === 0);
                if (isActive || !this.jc(panel.id, cachedPanel)) {
                    // Override order
                    const newPanel = {
                        id: panel.id,
                        name: panel.name,
                        order: panel.order,
                        requestedIndex: panel.requestedIndex
                    };
                    this.Gb.addComposite(newPanel);
                    // Pin it by default if it is new
                    if (!cachedPanel) {
                        this.Gb.pin(panel.id);
                    }
                    if (isActive) {
                        this.Gb.activateComposite(panel.id);
                        // Only try to open the panel if it has been created and visible
                        if (!activePanel && this.element && this.u.isVisible(this.Ub)) {
                            this.doOpenPanel(panel.id);
                        }
                    }
                }
            }
            for (const panel of panels) {
                const viewContainer = this.wc(panel.id);
                const viewContainerModel = this.Rb.getViewContainerModel(viewContainer);
                this.gc(viewContainer, viewContainerModel);
                this.ic(viewContainer, viewContainerModel);
                const disposables = new lifecycle_1.$jc();
                disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.ic(viewContainer, viewContainerModel)));
                disposables.add(viewContainerModel.onDidChangeContainerInfo(() => this.gc(viewContainer, viewContainerModel)));
                this.Kb.set(panel.id, disposables);
            }
        }
        async fc(panelId) {
            const disposable = this.Kb.get(panelId);
            disposable?.dispose();
            this.Kb.delete(panelId);
            const activeContainers = this.Rb.getViewContainersByLocation(this.Yb)
                .filter(container => this.Rb.getViewContainerModel(container).activeViewDescriptors.length > 0);
            if (activeContainers.length) {
                if (this.getActivePaneComposite()?.getId() === panelId) {
                    const defaultPanelId = this.Rb.getDefaultViewContainer(this.Yb)?.id;
                    const containerToOpen = activeContainers.filter(c => c.id === defaultPanelId)[0] || activeContainers[0];
                    await this.openPaneComposite(containerToOpen.id);
                }
            }
            else {
                this.u.setPartHidden(true, this.Ub);
            }
            this.Eb(panelId);
        }
        gc(viewContainer, viewContainerModel) {
            const cachedTitle = this.Ic().filter(panel => panel.id === viewContainer.id)[0]?.name;
            const activity = {
                id: viewContainer.id,
                name: this.Nb || cachedTitle === undefined ? viewContainerModel.title : cachedTitle,
                keybindingId: viewContainerModel.keybindingId
            };
            const { activityAction, pinnedAction } = this.yc(viewContainer.id);
            activityAction.setActivity(this.toActivity(viewContainerModel));
            if (pinnedAction instanceof panelActions_1.$Mtb) {
                pinnedAction.setActivity(activity);
            }
            // Composite Bar Swither needs to refresh tabs sizes and overflow action
            this.Gb.recomputeSizes();
            this.tc();
            // only update our cached panel info after extensions are done registering
            if (this.Nb) {
                this.Cc();
            }
        }
        toActivity(viewContainerModel) {
            return $6xb_1.hc(viewContainerModel.viewContainer.id, viewContainerModel.title, this.ac.useIcons ? viewContainerModel.icon : undefined, viewContainerModel.keybindingId);
        }
        static hc(id, name, icon, keybindingId) {
            let classNames = undefined;
            let iconUrl = undefined;
            if (uri_1.URI.isUri(icon)) {
                iconUrl = icon;
                const cssUrl = (0, dom_1.$nP)(icon);
                const hash = new hash_1.$vi();
                hash.update(cssUrl);
                const iconId = `activity-${id.replace(/\./g, '-')}-${hash.digest()}`;
                classNames = [iconId, 'uri-icon'];
                const iconClass = `.monaco-workbench .basepanel .monaco-action-bar .action-label.${iconId}`;
                (0, dom_1.$ZO)(iconClass, `
				mask: ${cssUrl} no-repeat 50% 50%;
				mask-size: 16px;
				-webkit-mask: ${cssUrl} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
				mask-origin: padding;
				-webkit-mask-origin: padding;
			`);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                classNames = themables_1.ThemeIcon.asClassNameArray(icon);
            }
            return { id, name, classNames, iconUrl, keybindingId };
        }
        ic(viewContainer, viewContainerModel) {
            let contextKey = this.Qb.get(viewContainer.id);
            if (!contextKey) {
                contextKey = this.Sb.createKey((0, contextkeys_1.$Jdb)(viewContainer.id), false);
                this.Qb.set(viewContainer.id, contextKey);
            }
            if (viewContainerModel.activeViewDescriptors.length) {
                contextKey.set(true);
                this.Gb.addComposite({ id: viewContainer.id, name: typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, order: viewContainer.order, requestedIndex: viewContainer.requestedIndex });
                if (this.u.isRestored() && this.u.isVisible(this.Ub)) {
                    const activeComposite = this.vb();
                    if (activeComposite === undefined || activeComposite.getId() === viewContainer.id) {
                        this.Gb.activateComposite(viewContainer.id);
                    }
                }
                this.tc();
                this.vc();
            }
            else if (viewContainer.hideIfEmpty) {
                contextKey.set(false);
                this.mc(viewContainer.id);
            }
        }
        jc(panelId, cachedPanel) {
            const viewContainer = this.wc(panelId);
            if (!viewContainer || !viewContainer.hideIfEmpty) {
                return false;
            }
            return cachedPanel?.views && cachedPanel.views.length
                ? cachedPanel.views.every(({ when }) => !!when && !this.Sb.contextMatchesRules(contextkey_1.$Ii.deserialize(when)))
                : false;
        }
        kc() {
            // Panel registration
            this.B(this.ib.onDidRegister(panel => this.ec([panel])));
            this.B(this.ib.onDidDeregister(panel => this.fc(panel.id)));
            // Activate on panel open
            this.B(this.onDidPaneCompositeOpen(panel => this.nc(panel)));
            // Deactivate on panel close
            this.B(this.onDidPaneCompositeClose(this.oc, this));
            // Extension registration
            const disposables = this.B(new lifecycle_1.$jc());
            this.B(this.Tb.onDidRegisterExtensions(() => {
                disposables.clear();
                this.lc();
                this.Gb.onDidChange(() => this.Cc(), this, disposables);
                this.eb.onDidChangeValue(0 /* StorageScope.PROFILE */, this.Vb, disposables)(() => this.Bc(), this, disposables);
            }));
        }
        lc() {
            this.Nb = true;
            // hide/remove composites
            const panels = this.getPaneComposites();
            for (const { id } of this.Dc()) {
                if (panels.every(panel => panel.id !== id)) {
                    if (this.Rb.isViewContainerRemovedPermanently(id)) {
                        this.Eb(id);
                    }
                    else {
                        this.mc(id);
                    }
                }
            }
            this.Cc();
        }
        mc(compositeId) {
            this.Gb.hideComposite(compositeId);
            const compositeActions = this.Hb.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.Hb.delete(compositeId);
            }
        }
        nc(panel) {
            this.Zb.set(panel.getId());
            const foundPanel = this.Ob.getPaneComposite(panel.getId());
            if (foundPanel) {
                this.Gb.addComposite(foundPanel);
            }
            // Activate composite when opened
            this.Gb.activateComposite(panel.getId());
            const panelDescriptor = this.Ob.getPaneComposite(panel.getId());
            if (panelDescriptor) {
                const viewContainer = this.wc(panelDescriptor.id);
                if (viewContainer?.hideIfEmpty) {
                    const viewContainerModel = this.Rb.getViewContainerModel(viewContainer);
                    if (viewContainerModel.activeViewDescriptors.length === 0) {
                        this.mc(panelDescriptor.id); // Update the composite bar by hiding
                    }
                }
            }
            this.tc(); // Need to relayout composite bar since different panels have different action bar width
            this.vc();
        }
        oc(panel) {
            const id = panel.getId();
            if (this.Zb.get() === id) {
                this.Zb.reset();
            }
            this.Gb.deactivateComposite(panel.getId());
            this.vc();
        }
        create(parent) {
            this.element = parent;
            super.create(parent);
            this.pc();
            const focusTracker = this.B((0, dom_1.$8O)(parent));
            this.B(focusTracker.onDidFocus(() => this.$b.set(true)));
            this.B(focusTracker.onDidBlur(() => this.$b.set(false)));
        }
        pc() {
            const contentArea = this.M();
            this.uc = document.createElement('div');
            this.uc.classList.add('empty-panel-message-area');
            const messageElement = document.createElement('div');
            messageElement.classList.add('empty-panel-message');
            messageElement.innerText = (0, nls_1.localize)(2, null);
            this.uc.appendChild(messageElement);
            contentArea.appendChild(this.uc);
            this.B(dnd_1.$zeb.INSTANCE.registerTarget(this.uc, {
                onDragOver: (e) => {
                    dom_1.$5O.stop(e.eventData, true);
                    const validDropTarget = this.Pb.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                    (0, dnd_1.$Aeb)(e.eventData.dataTransfer, 'move', validDropTarget);
                },
                onDragEnter: (e) => {
                    dom_1.$5O.stop(e.eventData, true);
                    const validDropTarget = this.Pb.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                    this.uc.style.backgroundColor = validDropTarget ? this.h.getColor(theme_1.$F_)?.toString() || '' : '';
                },
                onDragLeave: (e) => {
                    dom_1.$5O.stop(e.eventData, true);
                    this.uc.style.backgroundColor = '';
                },
                onDragEnd: (e) => {
                    dom_1.$5O.stop(e.eventData, true);
                    this.uc.style.backgroundColor = '';
                },
                onDrop: (e) => {
                    dom_1.$5O.stop(e.eventData, true);
                    this.uc.style.backgroundColor = '';
                    this.Pb.drop(e.dragAndDropData, undefined, e.eventData);
                },
            }));
        }
        I(parent) {
            const element = super.I(parent);
            const globalTitleActionsContainer = element.appendChild((0, dom_1.$)('.global-actions'));
            // Global Actions Toolbar
            this.Ib = this.B(new toolbar_1.$6R(globalTitleActionsContainer, this.fb, {
                actionViewItemProvider: action => this.Ab(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                getKeyBinding: action => this.gb.lookupKeybinding(action.id),
                anchorAlignmentProvider: () => this.Db(),
                toggleMenuTitle: (0, nls_1.localize)(3, null)
            }));
            this.xc();
            return element;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.$uf)(this.getContainer());
            container.style.backgroundColor = this.z(this.Xb) || '';
            const borderColor = this.z(colorRegistry_1.$Av) || '';
            container.style.borderLeftColor = borderColor;
            container.style.borderRightColor = borderColor;
            const title = this.J();
            if (title) {
                title.style.borderTopColor = this.z(colorRegistry_1.$Av) || '';
            }
        }
        doOpenPanel(id, focus) {
            if (this.Lb) {
                return undefined; // Workaround against a potential race condition
            }
            // First check if panel is hidden and show if so
            if (!this.u.isVisible(this.Ub)) {
                try {
                    this.Lb = true;
                    this.u.setPartHidden(false, this.Ub);
                }
                finally {
                    this.Lb = false;
                }
            }
            return this.ob(id, focus);
        }
        async openPaneComposite(id, focus) {
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenPanel(id, focus);
            }
            await this.Tb.whenInstalledExtensionsRegistered();
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenPanel(id, focus);
            }
            return undefined;
        }
        showActivity(panelId, badge, clazz) {
            return this.Gb.showActivity(panelId, badge, clazz);
        }
        getPaneComposite(panelId) {
            return this.Ob.getPaneComposite(panelId);
        }
        getPaneComposites() {
            return this.Ob.getPaneComposites()
                .sort((v1, v2) => {
                if (typeof v1.order !== 'number') {
                    return 1;
                }
                if (typeof v2.order !== 'number') {
                    return -1;
                }
                return v1.order - v2.order;
            });
        }
        getPinnedPaneCompositeIds() {
            const pinnedCompositeIds = this.Gb.getPinnedComposites().map(c => c.id);
            return this.getPaneComposites()
                .filter(p => pinnedCompositeIds.includes(p.id))
                .sort((p1, p2) => pinnedCompositeIds.indexOf(p1.id) - pinnedCompositeIds.indexOf(p2.id))
                .map(p => p.id);
        }
        getVisiblePaneCompositeIds() {
            return this.Gb.getVisibleComposites()
                .filter(v => this.getActivePaneComposite()?.getId() === v.id || this.Gb.isPinned(v.id))
                .map(v => v.id);
        }
        getActivePaneComposite() {
            return this.vb();
        }
        getLastActivePaneCompositeId() {
            return this.wb();
        }
        hideActivePaneComposite() {
            // First check if panel is visible and hide if so
            if (this.u.isVisible(this.Ub)) {
                this.u.setPartHidden(true, this.Ub);
            }
            this.xb();
        }
        zb(parent) {
            const titleArea = this.Gb.create(parent);
            titleArea.classList.add('panel-switcher-container');
            return {
                updateTitle: (id, title, keybinding) => {
                    const action = this.Gb.getAction(id);
                    if (action) {
                        action.label = title;
                    }
                },
                updateStyles: () => {
                    // Handled via theming participant
                }
            };
        }
        sb(compositeId) {
            super.sb(compositeId);
            // If title actions change, relayout the composite bar
            this.tc();
        }
        layout(width, height, top, left) {
            if (!this.u.isVisible(this.Ub)) {
                return;
            }
            this.Mb = new dom_1.$BO(width, height);
            // Layout contents
            super.layout(this.Mb.width, this.Mb.height, top, left);
            // Layout composite bar
            this.tc();
            // Add empty panel message
            this.vc();
        }
        tc() {
            if (this.Mb && this.dimension) {
                let availableWidth = this.Mb.width - 40; // take padding into account
                if (this.y) {
                    availableWidth = Math.max($6xb_1.Fb, availableWidth - this.Ac()); // adjust height for global actions showing
                }
                this.Gb.layout(new dom_1.$BO(availableWidth, this.dimension.height));
            }
        }
        vc() {
            this.uc?.classList.toggle('visible', this.Gb.getVisibleComposites().length === 0);
        }
        wc(id) {
            const viewContainer = this.Rb.getViewContainerById(id);
            return viewContainer && this.Rb.getViewContainerLocation(viewContainer) === this.Yb ? viewContainer : undefined;
        }
        xc() {
            const primaryActions = this.Jb.getPrimaryActions();
            const secondaryActions = this.Jb.getSecondaryActions();
            this.Ib?.setActions((0, actionbar_1.$2P)(primaryActions), (0, actionbar_1.$2P)(secondaryActions));
        }
        yc(compositeId) {
            let compositeActions = this.Hb.get(compositeId);
            if (!compositeActions) {
                // const panel = this.getPaneComposite(compositeId);
                const viewContainer = this.wc(compositeId);
                if (viewContainer) {
                    const viewContainerModel = this.Rb.getViewContainerModel(viewContainer);
                    compositeActions = {
                        activityAction: this.hb.createInstance(panelActions_1.$Ktb, this.toActivity(viewContainerModel), this.Yb),
                        pinnedAction: new compositeBarActions_1.$Htb(this.toActivity(viewContainerModel), this.Gb),
                        badgeAction: new compositeBarActions_1.$Itb(this.toActivity(viewContainerModel), this.Gb)
                    };
                }
                else {
                    compositeActions = {
                        activityAction: this.hb.createInstance(panelActions_1.$Ltb, compositeId, this.Yb),
                        pinnedAction: new panelActions_1.$Mtb(compositeId, this.Gb),
                        badgeAction: new activitybarActions_1.$Yxb(compositeId, this.Gb)
                    };
                }
                this.Hb.set(compositeId, compositeActions);
            }
            return compositeActions;
        }
        Eb(compositeId) {
            if (super.Eb(compositeId)) {
                this.Gb.removeComposite(compositeId);
                const compositeActions = this.Hb.get(compositeId);
                if (compositeActions) {
                    compositeActions.activityAction.dispose();
                    compositeActions.pinnedAction.dispose();
                    this.Hb.delete(compositeId);
                }
                return true;
            }
            return false;
        }
        Ac() {
            const activePanel = this.getActivePaneComposite();
            if (!activePanel || !this.y) {
                return 0;
            }
            return this.y.getItemsWidth() + (this.Ib?.getItemsWidth() ?? 0);
        }
        Bc() {
            if (this.Fc !== this.Gc() /* This checks if current window changed the value or not */) {
                this.Ec = undefined;
                const newCompositeItems = [];
                const compositeItems = this.Gb.getCompositeBarItems();
                const cachedPanels = this.Dc();
                for (const cachedPanel of cachedPanels) {
                    // copy behavior from activity bar
                    newCompositeItems.push({
                        id: cachedPanel.id,
                        name: cachedPanel.name,
                        order: cachedPanel.order,
                        pinned: cachedPanel.pinned,
                        visible: !!compositeItems.find(({ id }) => id === cachedPanel.id)
                    });
                }
                for (let index = 0; index < compositeItems.length; index++) {
                    // Add items currently exists but does not exist in new.
                    if (!newCompositeItems.some(({ id }) => id === compositeItems[index].id)) {
                        newCompositeItems.splice(index, 0, compositeItems[index]);
                    }
                }
                this.Gb.setCompositeBarItems(newCompositeItems);
            }
        }
        Cc() {
            const state = [];
            const placeholders = [];
            const compositeItems = this.Gb.getCompositeBarItems();
            for (const compositeItem of compositeItems) {
                const viewContainer = this.wc(compositeItem.id);
                if (viewContainer) {
                    const viewContainerModel = this.Rb.getViewContainerModel(viewContainer);
                    state.push({ id: compositeItem.id, name: viewContainerModel.title, pinned: compositeItem.pinned, order: compositeItem.order, visible: compositeItem.visible });
                    placeholders.push({ id: compositeItem.id, name: this.yc(compositeItem.id).activityAction.label });
                }
                else {
                    state.push({ id: compositeItem.id, name: compositeItem.name, pinned: compositeItem.pinned, order: compositeItem.order, visible: compositeItem.visible });
                }
            }
            this.Fc = JSON.stringify(state);
            this.Jc(placeholders);
        }
        Dc() {
            const registeredPanels = this.getPaneComposites();
            const storedStates = JSON.parse(this.Fc);
            const cachedPanels = storedStates.map(c => {
                const serialized = typeof c === 'string' /* migration from pinned states to composites states */ ? { id: c, pinned: true, order: undefined, visible: true } : c;
                const registered = registeredPanels.some(p => p.id === serialized.id);
                serialized.visible = registered ? (0, types_1.$sf)(serialized.visible) ? true : serialized.visible : false;
                return serialized;
            });
            for (const placeholderViewContainer of this.Ic()) {
                const cachedViewContainer = cachedPanels.filter(cached => cached.id === placeholderViewContainer.id)[0];
                if (cachedViewContainer) {
                    cachedViewContainer.name = placeholderViewContainer.name;
                }
            }
            return cachedPanels;
        }
        get Fc() {
            if (!this.Ec) {
                this.Ec = this.Gc();
            }
            return this.Ec;
        }
        set Fc(cachedViewletsValue) {
            if (this.Fc !== cachedViewletsValue) {
                this.Ec = cachedViewletsValue;
                this.Hc(cachedViewletsValue);
            }
        }
        Gc() {
            return this.eb.get(this.Vb, 0 /* StorageScope.PROFILE */, '[]');
        }
        Hc(value) {
            this.eb.store(this.Vb, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        Ic() {
            return JSON.parse(this.Lc);
        }
        Jc(placeholderViewContainers) {
            this.Lc = JSON.stringify(placeholderViewContainers);
        }
        get Lc() {
            if (!this.Kc) {
                this.Kc = this.Mc();
            }
            return this.Kc;
        }
        set Lc(placeholderViewContainesValue) {
            if (this.Lc !== placeholderViewContainesValue) {
                this.Kc = placeholderViewContainesValue;
                this.Nc(placeholderViewContainesValue);
            }
        }
        Mc() {
            return this.eb.get(this.Wb, 1 /* StorageScope.WORKSPACE */, '[]');
        }
        Nc(value) {
            this.eb.store(this.Wb, value, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
    };
    exports.$6xb = $6xb;
    exports.$6xb = $6xb = $6xb_1 = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, storage_1.$Vo),
        __param(2, contextView_1.$WZ),
        __param(3, layoutService_1.$Meb),
        __param(4, keybinding_1.$2D),
        __param(5, instantiation_1.$Ah),
        __param(6, themeService_1.$gv),
        __param(7, views_1.$_E),
        __param(8, contextkey_1.$3i),
        __param(9, extensions_1.$MF)
    ], $6xb);
    let $7xb = class $7xb extends $6xb {
        static { $7xb_1 = this; }
        static { this.activePanelSettingsKey = 'workbench.panelpart.activepanelid'; }
        constructor(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, Oc, Pc) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, "workbench.parts.panel" /* Parts.PANEL_PART */, $7xb_1.activePanelSettingsKey, 'workbench.panel.pinnedPanels', 'workbench.panel.placeholderPanels', panecomposite_1.$Web.Panels, theme_1.$L_, 1 /* ViewContainerLocation.Panel */, contextkeys_1.$Bdb.bindTo(contextKeyService), contextkeys_1.$Cdb.bindTo(contextKeyService), {
                useIcons: false,
                hasTitle: true
            });
            this.Oc = Oc;
            this.Pc = Pc;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.$uf)(this.getContainer());
            const borderColor = this.z(theme_1.$M_) || this.z(colorRegistry_1.$Av) || '';
            container.style.borderLeftColor = borderColor;
            container.style.borderRightColor = borderColor;
            const title = this.J();
            if (title) {
                title.style.borderTopColor = this.z(theme_1.$M_) || this.z(colorRegistry_1.$Av) || '';
            }
        }
        bc() {
            return {
                position: () => this.u.getPanelPosition() === 2 /* Position.BOTTOM */ && !this.u.isPanelMaximized() ? 3 /* HoverPosition.ABOVE */ : 2 /* HoverPosition.BELOW */,
            };
        }
        cc(actions) {
            const panelPositionMenu = this.Pc.createMenu(actions_3.$Ru.PanelPositionMenu, this.Sb);
            const panelAlignMenu = this.Pc.createMenu(actions_3.$Ru.PanelAlignmentMenu, this.Sb);
            const positionActions = [];
            const alignActions = [];
            (0, menuEntryActionViewItem_1.$A3)(panelPositionMenu, { shouldForwardArgs: true }, { primary: [], secondary: positionActions });
            (0, menuEntryActionViewItem_1.$A3)(panelAlignMenu, { shouldForwardArgs: true }, { primary: [], secondary: alignActions });
            panelAlignMenu.dispose();
            panelPositionMenu.dispose();
            actions.push(...[
                new actions_1.$ii(),
                new actions_1.$ji('workbench.action.panel.position', (0, nls_1.localize)(4, null), positionActions),
                new actions_1.$ji('workbench.action.panel.align', (0, nls_1.localize)(5, null), alignActions),
                (0, actions_1.$li)({ id: panelActions_1.$Jtb.ID, label: (0, nls_1.localize)(6, null), run: () => this.Oc.executeCommand(panelActions_1.$Jtb.ID) })
            ]);
        }
        layout(width, height, top, left) {
            let dimensions;
            if (this.u.getPanelPosition() === 1 /* Position.RIGHT */) {
                dimensions = new dom_1.$BO(width - 1, height); // Take into account the 1px border when layouting
            }
            else {
                dimensions = new dom_1.$BO(width, height);
            }
            // Layout contents
            super.layout(dimensions.width, dimensions.height, top, left);
        }
        toJSON() {
            return {
                type: "workbench.parts.panel" /* Parts.PANEL_PART */
            };
        }
    };
    exports.$7xb = $7xb;
    exports.$7xb = $7xb = $7xb_1 = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, storage_1.$Vo),
        __param(2, telemetry_1.$9k),
        __param(3, contextView_1.$WZ),
        __param(4, layoutService_1.$Meb),
        __param(5, keybinding_1.$2D),
        __param(6, instantiation_1.$Ah),
        __param(7, themeService_1.$gv),
        __param(8, views_1.$_E),
        __param(9, contextkey_1.$3i),
        __param(10, extensions_1.$MF),
        __param(11, commands_1.$Fr),
        __param(12, actions_3.$Su)
    ], $7xb);
});
//# sourceMappingURL=panelPart.js.map