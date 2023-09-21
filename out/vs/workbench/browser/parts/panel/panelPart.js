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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/common/contextkeys", "vs/workbench/browser/parts/compositePart", "vs/workbench/services/layout/browser/layoutService", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/panel/panelActions", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/compositeBar", "vs/workbench/browser/parts/compositeBarActions", "vs/platform/notification/common/notification", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/extensions/common/extensions", "vs/workbench/common/views", "vs/workbench/browser/dnd", "vs/workbench/browser/panecomposite", "vs/workbench/browser/actions", "vs/platform/actions/common/actions", "vs/base/common/hash", "vs/base/common/uri", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/activitybar/activitybarActions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/css!./media/basepanelpart", "vs/css!./media/panelpart"], function (require, exports, nls_1, actions_1, event_1, platform_1, actionbar_1, contextkeys_1, compositePart_1, layoutService_1, storage_1, contextView_1, telemetry_1, keybinding_1, instantiation_1, panelActions_1, themeService_1, themables_1, theme_1, colorRegistry_1, compositeBar_1, compositeBarActions_1, notification_1, dom_1, lifecycle_1, contextkey_1, types_1, extensions_1, views_1, dnd_1, panecomposite_1, actions_2, actions_3, hash_1, uri_1, toolbar_1, commands_1, activitybarActions_1, menuEntryActionViewItem_1) {
    "use strict";
    var BasePanelPart_1, PanelPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PanelPart = exports.BasePanelPart = void 0;
    let BasePanelPart = class BasePanelPart extends compositePart_1.CompositePart {
        static { BasePanelPart_1 = this; }
        static { this.MIN_COMPOSITE_BAR_WIDTH = 50; }
        get snap() {
            // Always allow snapping closed
            // Only allow dragging open if the panel contains view containers
            return this.layoutService.isVisible(this.partId) || this.compositeBar.getVisibleComposites().length > 0;
        }
        get preferredHeight() {
            // Don't worry about titlebar or statusbar visibility
            // The difference is minimal and keeps this function clean
            return this.layoutService.dimension.height * 0.4;
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
        get onDidPaneCompositeOpen() { return event_1.Event.map(this.onDidCompositeOpen.event, compositeEvent => compositeEvent.composite); }
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, partId, activePanelSettingsKey, pinnedPanelsKey, placeholdeViewContainersKey, panelRegistryId, backgroundColor, viewContainerLocation, activePanelContextKey, panelFocusContextKey, panelOptions) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, platform_1.Registry.as(panelRegistryId), activePanelSettingsKey, viewDescriptorService.getDefaultViewContainer(viewContainerLocation)?.id || '', 'panel', 'panel', undefined, partId, panelOptions);
            this.viewDescriptorService = viewDescriptorService;
            this.contextKeyService = contextKeyService;
            this.extensionService = extensionService;
            this.partId = partId;
            this.pinnedPanelsKey = pinnedPanelsKey;
            this.placeholdeViewContainersKey = placeholdeViewContainersKey;
            this.backgroundColor = backgroundColor;
            this.viewContainerLocation = viewContainerLocation;
            this.activePanelContextKey = activePanelContextKey;
            this.panelFocusContextKey = panelFocusContextKey;
            this.panelOptions = panelOptions;
            //#region IView
            this.minimumWidth = 300;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 77;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.onDidPaneCompositeClose = this.onDidCompositeClose.event;
            this.compositeActions = new Map();
            this.panelDisposables = new Map();
            this.blockOpeningPanel = false;
            this.extensionsRegistered = false;
            this.enabledViewContainersContextKeys = new Map();
            this.panelRegistry = platform_1.Registry.as(panelRegistryId);
            this.dndHandler = new compositeBar_1.CompositeDragAndDrop(this.viewDescriptorService, this.viewContainerLocation, (id, focus) => this.openPaneComposite(id, focus).then(panel => panel || null), (from, to, before) => this.compositeBar.move(from, to, before?.horizontallyBefore), () => this.compositeBar.getCompositeBarItems());
            this.compositeBar = this._register(this.instantiationService.createInstance(compositeBar_1.CompositeBar, this.getCachedPanels(), {
                icon: !!this.panelOptions.useIcons,
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                activityHoverOptions: this.getActivityHoverOptions(),
                openComposite: (compositeId, preserveFocus) => this.openPaneComposite(compositeId, !preserveFocus).then(panel => panel || null),
                getActivityAction: compositeId => this.getCompositeActions(compositeId).activityAction,
                getCompositePinnedAction: compositeId => this.getCompositeActions(compositeId).pinnedAction,
                getCompositeBadgeAction: compositeId => this.getCompositeActions(compositeId).badgeAction,
                getOnCompositeClickAction: compositeId => this.instantiationService.createInstance(panelActions_1.PanelActivityAction, (0, types_1.assertIsDefined)(this.getPaneComposite(compositeId)), this.viewContainerLocation),
                fillExtraContextMenuActions: actions => this.fillExtraContextMenuActions(actions),
                getContextMenuActionsForComposite: compositeId => this.getContextMenuActionsForComposite(compositeId),
                getDefaultCompositeId: () => viewDescriptorService.getDefaultViewContainer(this.viewContainerLocation)?.id,
                hidePart: () => this.layoutService.setPartHidden(true, this.partId),
                dndHandler: this.dndHandler,
                compositeSize: 0,
                overflowActionSize: 44,
                colors: theme => ({
                    activeBackgroundColor: theme.getColor(this.backgroundColor),
                    inactiveBackgroundColor: theme.getColor(this.backgroundColor),
                    activeBorderBottomColor: theme.getColor(theme_1.PANEL_ACTIVE_TITLE_BORDER),
                    activeForegroundColor: theme.getColor(theme_1.PANEL_ACTIVE_TITLE_FOREGROUND),
                    inactiveForegroundColor: theme.getColor(theme_1.PANEL_INACTIVE_TITLE_FOREGROUND),
                    badgeBackground: theme.getColor(colorRegistry_1.badgeBackground),
                    badgeForeground: theme.getColor(colorRegistry_1.badgeForeground),
                    dragAndDropBorder: theme.getColor(theme_1.PANEL_DRAG_AND_DROP_BORDER)
                })
            }));
            this.registerListeners();
            this.onDidRegisterPanels([...this.getPaneComposites()]);
            // Global Panel Actions
            this.globalActions = this._register(this.instantiationService.createInstance(actions_2.CompositeMenuActions, partId === "workbench.parts.panel" /* Parts.PANEL_PART */ ? actions_3.MenuId.PanelTitle : actions_3.MenuId.AuxiliaryBarTitle, undefined, undefined));
            this._register(this.globalActions.onDidChange(() => this.updateGlobalToolbarActions()));
        }
        getContextMenuActionsForComposite(compositeId) {
            const result = [];
            const viewContainer = this.viewDescriptorService.getViewContainerById(compositeId);
            const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
            if (defaultLocation !== this.viewDescriptorService.getViewContainerLocation(viewContainer)) {
                result.push((0, actions_1.toAction)({ id: 'resetLocationAction', label: (0, nls_1.localize)('resetLocation', "Reset Location"), run: () => this.viewDescriptorService.moveViewContainerToLocation(viewContainer, defaultLocation) }));
            }
            else {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                if (viewContainerModel.allViewDescriptors.length === 1) {
                    const viewToReset = viewContainerModel.allViewDescriptors[0];
                    const defaultContainer = this.viewDescriptorService.getDefaultContainerById(viewToReset.id);
                    if (defaultContainer !== viewContainer) {
                        result.push((0, actions_1.toAction)({ id: 'resetLocationAction', label: (0, nls_1.localize)('resetLocation', "Reset Location"), run: () => this.viewDescriptorService.moveViewsToContainer([viewToReset], defaultContainer) }));
                    }
                }
            }
            return result;
        }
        onDidRegisterPanels(panels) {
            const cachedPanels = this.getCachedPanels();
            for (const panel of panels) {
                const cachedPanel = cachedPanels.filter(({ id }) => id === panel.id)[0];
                const activePanel = this.getActivePaneComposite();
                const isActive = activePanel?.getId() === panel.id ||
                    (this.extensionsRegistered && this.compositeBar.getVisibleComposites().length === 0);
                if (isActive || !this.shouldBeHidden(panel.id, cachedPanel)) {
                    // Override order
                    const newPanel = {
                        id: panel.id,
                        name: panel.name,
                        order: panel.order,
                        requestedIndex: panel.requestedIndex
                    };
                    this.compositeBar.addComposite(newPanel);
                    // Pin it by default if it is new
                    if (!cachedPanel) {
                        this.compositeBar.pin(panel.id);
                    }
                    if (isActive) {
                        this.compositeBar.activateComposite(panel.id);
                        // Only try to open the panel if it has been created and visible
                        if (!activePanel && this.element && this.layoutService.isVisible(this.partId)) {
                            this.doOpenPanel(panel.id);
                        }
                    }
                }
            }
            for (const panel of panels) {
                const viewContainer = this.getViewContainer(panel.id);
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                this.updateActivity(viewContainer, viewContainerModel);
                this.showOrHideViewContainer(viewContainer, viewContainerModel);
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.showOrHideViewContainer(viewContainer, viewContainerModel)));
                disposables.add(viewContainerModel.onDidChangeContainerInfo(() => this.updateActivity(viewContainer, viewContainerModel)));
                this.panelDisposables.set(panel.id, disposables);
            }
        }
        async onDidDeregisterPanel(panelId) {
            const disposable = this.panelDisposables.get(panelId);
            disposable?.dispose();
            this.panelDisposables.delete(panelId);
            const activeContainers = this.viewDescriptorService.getViewContainersByLocation(this.viewContainerLocation)
                .filter(container => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
            if (activeContainers.length) {
                if (this.getActivePaneComposite()?.getId() === panelId) {
                    const defaultPanelId = this.viewDescriptorService.getDefaultViewContainer(this.viewContainerLocation)?.id;
                    const containerToOpen = activeContainers.filter(c => c.id === defaultPanelId)[0] || activeContainers[0];
                    await this.openPaneComposite(containerToOpen.id);
                }
            }
            else {
                this.layoutService.setPartHidden(true, this.partId);
            }
            this.removeComposite(panelId);
        }
        updateActivity(viewContainer, viewContainerModel) {
            const cachedTitle = this.getPlaceholderViewContainers().filter(panel => panel.id === viewContainer.id)[0]?.name;
            const activity = {
                id: viewContainer.id,
                name: this.extensionsRegistered || cachedTitle === undefined ? viewContainerModel.title : cachedTitle,
                keybindingId: viewContainerModel.keybindingId
            };
            const { activityAction, pinnedAction } = this.getCompositeActions(viewContainer.id);
            activityAction.setActivity(this.toActivity(viewContainerModel));
            if (pinnedAction instanceof panelActions_1.PlaceHolderToggleCompositePinnedAction) {
                pinnedAction.setActivity(activity);
            }
            // Composite Bar Swither needs to refresh tabs sizes and overflow action
            this.compositeBar.recomputeSizes();
            this.layoutCompositeBar();
            // only update our cached panel info after extensions are done registering
            if (this.extensionsRegistered) {
                this.saveCachedPanels();
            }
        }
        toActivity(viewContainerModel) {
            return BasePanelPart_1.toActivity(viewContainerModel.viewContainer.id, viewContainerModel.title, this.panelOptions.useIcons ? viewContainerModel.icon : undefined, viewContainerModel.keybindingId);
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
                classNames = [iconId, 'uri-icon'];
                const iconClass = `.monaco-workbench .basepanel .monaco-action-bar .action-label.${iconId}`;
                (0, dom_1.createCSSRule)(iconClass, `
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
        showOrHideViewContainer(viewContainer, viewContainerModel) {
            let contextKey = this.enabledViewContainersContextKeys.get(viewContainer.id);
            if (!contextKey) {
                contextKey = this.contextKeyService.createKey((0, contextkeys_1.getEnabledViewContainerContextKey)(viewContainer.id), false);
                this.enabledViewContainersContextKeys.set(viewContainer.id, contextKey);
            }
            if (viewContainerModel.activeViewDescriptors.length) {
                contextKey.set(true);
                this.compositeBar.addComposite({ id: viewContainer.id, name: typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, order: viewContainer.order, requestedIndex: viewContainer.requestedIndex });
                if (this.layoutService.isRestored() && this.layoutService.isVisible(this.partId)) {
                    const activeComposite = this.getActiveComposite();
                    if (activeComposite === undefined || activeComposite.getId() === viewContainer.id) {
                        this.compositeBar.activateComposite(viewContainer.id);
                    }
                }
                this.layoutCompositeBar();
                this.layoutEmptyMessage();
            }
            else if (viewContainer.hideIfEmpty) {
                contextKey.set(false);
                this.hideComposite(viewContainer.id);
            }
        }
        shouldBeHidden(panelId, cachedPanel) {
            const viewContainer = this.getViewContainer(panelId);
            if (!viewContainer || !viewContainer.hideIfEmpty) {
                return false;
            }
            return cachedPanel?.views && cachedPanel.views.length
                ? cachedPanel.views.every(({ when }) => !!when && !this.contextKeyService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(when)))
                : false;
        }
        registerListeners() {
            // Panel registration
            this._register(this.registry.onDidRegister(panel => this.onDidRegisterPanels([panel])));
            this._register(this.registry.onDidDeregister(panel => this.onDidDeregisterPanel(panel.id)));
            // Activate on panel open
            this._register(this.onDidPaneCompositeOpen(panel => this.onPanelOpen(panel)));
            // Deactivate on panel close
            this._register(this.onDidPaneCompositeClose(this.onPanelClose, this));
            // Extension registration
            const disposables = this._register(new lifecycle_1.DisposableStore());
            this._register(this.extensionService.onDidRegisterExtensions(() => {
                disposables.clear();
                this.onDidRegisterExtensions();
                this.compositeBar.onDidChange(() => this.saveCachedPanels(), this, disposables);
                this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, this.pinnedPanelsKey, disposables)(() => this.onDidStorageValueChange(), this, disposables);
            }));
        }
        onDidRegisterExtensions() {
            this.extensionsRegistered = true;
            // hide/remove composites
            const panels = this.getPaneComposites();
            for (const { id } of this.getCachedPanels()) {
                if (panels.every(panel => panel.id !== id)) {
                    if (this.viewDescriptorService.isViewContainerRemovedPermanently(id)) {
                        this.removeComposite(id);
                    }
                    else {
                        this.hideComposite(id);
                    }
                }
            }
            this.saveCachedPanels();
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
        onPanelOpen(panel) {
            this.activePanelContextKey.set(panel.getId());
            const foundPanel = this.panelRegistry.getPaneComposite(panel.getId());
            if (foundPanel) {
                this.compositeBar.addComposite(foundPanel);
            }
            // Activate composite when opened
            this.compositeBar.activateComposite(panel.getId());
            const panelDescriptor = this.panelRegistry.getPaneComposite(panel.getId());
            if (panelDescriptor) {
                const viewContainer = this.getViewContainer(panelDescriptor.id);
                if (viewContainer?.hideIfEmpty) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    if (viewContainerModel.activeViewDescriptors.length === 0) {
                        this.hideComposite(panelDescriptor.id); // Update the composite bar by hiding
                    }
                }
            }
            this.layoutCompositeBar(); // Need to relayout composite bar since different panels have different action bar width
            this.layoutEmptyMessage();
        }
        onPanelClose(panel) {
            const id = panel.getId();
            if (this.activePanelContextKey.get() === id) {
                this.activePanelContextKey.reset();
            }
            this.compositeBar.deactivateComposite(panel.getId());
            this.layoutEmptyMessage();
        }
        create(parent) {
            this.element = parent;
            super.create(parent);
            this.createEmptyPanelMessage();
            const focusTracker = this._register((0, dom_1.trackFocus)(parent));
            this._register(focusTracker.onDidFocus(() => this.panelFocusContextKey.set(true)));
            this._register(focusTracker.onDidBlur(() => this.panelFocusContextKey.set(false)));
        }
        createEmptyPanelMessage() {
            const contentArea = this.getContentArea();
            this.emptyPanelMessageElement = document.createElement('div');
            this.emptyPanelMessageElement.classList.add('empty-panel-message-area');
            const messageElement = document.createElement('div');
            messageElement.classList.add('empty-panel-message');
            messageElement.innerText = (0, nls_1.localize)('panel.emptyMessage', "Drag a view here to display.");
            this.emptyPanelMessageElement.appendChild(messageElement);
            contentArea.appendChild(this.emptyPanelMessageElement);
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerTarget(this.emptyPanelMessageElement, {
                onDragOver: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    const validDropTarget = this.dndHandler.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                    (0, dnd_1.toggleDropEffect)(e.eventData.dataTransfer, 'move', validDropTarget);
                },
                onDragEnter: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    const validDropTarget = this.dndHandler.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                    this.emptyPanelMessageElement.style.backgroundColor = validDropTarget ? this.theme.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND)?.toString() || '' : '';
                },
                onDragLeave: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    this.emptyPanelMessageElement.style.backgroundColor = '';
                },
                onDragEnd: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    this.emptyPanelMessageElement.style.backgroundColor = '';
                },
                onDrop: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    this.emptyPanelMessageElement.style.backgroundColor = '';
                    this.dndHandler.drop(e.dragAndDropData, undefined, e.eventData);
                },
            }));
        }
        createTitleArea(parent) {
            const element = super.createTitleArea(parent);
            const globalTitleActionsContainer = element.appendChild((0, dom_1.$)('.global-actions'));
            // Global Actions Toolbar
            this.globalToolBar = this._register(new toolbar_1.ToolBar(globalTitleActionsContainer, this.contextMenuService, {
                actionViewItemProvider: action => this.actionViewItemProvider(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                anchorAlignmentProvider: () => this.getTitleAreaDropDownAnchorAlignment(),
                toggleMenuTitle: (0, nls_1.localize)('moreActions', "More Actions...")
            }));
            this.updateGlobalToolbarActions();
            return element;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            container.style.backgroundColor = this.getColor(this.backgroundColor) || '';
            const borderColor = this.getColor(colorRegistry_1.contrastBorder) || '';
            container.style.borderLeftColor = borderColor;
            container.style.borderRightColor = borderColor;
            const title = this.getTitleArea();
            if (title) {
                title.style.borderTopColor = this.getColor(colorRegistry_1.contrastBorder) || '';
            }
        }
        doOpenPanel(id, focus) {
            if (this.blockOpeningPanel) {
                return undefined; // Workaround against a potential race condition
            }
            // First check if panel is hidden and show if so
            if (!this.layoutService.isVisible(this.partId)) {
                try {
                    this.blockOpeningPanel = true;
                    this.layoutService.setPartHidden(false, this.partId);
                }
                finally {
                    this.blockOpeningPanel = false;
                }
            }
            return this.openComposite(id, focus);
        }
        async openPaneComposite(id, focus) {
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenPanel(id, focus);
            }
            await this.extensionService.whenInstalledExtensionsRegistered();
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenPanel(id, focus);
            }
            return undefined;
        }
        showActivity(panelId, badge, clazz) {
            return this.compositeBar.showActivity(panelId, badge, clazz);
        }
        getPaneComposite(panelId) {
            return this.panelRegistry.getPaneComposite(panelId);
        }
        getPaneComposites() {
            return this.panelRegistry.getPaneComposites()
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
            const pinnedCompositeIds = this.compositeBar.getPinnedComposites().map(c => c.id);
            return this.getPaneComposites()
                .filter(p => pinnedCompositeIds.includes(p.id))
                .sort((p1, p2) => pinnedCompositeIds.indexOf(p1.id) - pinnedCompositeIds.indexOf(p2.id))
                .map(p => p.id);
        }
        getVisiblePaneCompositeIds() {
            return this.compositeBar.getVisibleComposites()
                .filter(v => this.getActivePaneComposite()?.getId() === v.id || this.compositeBar.isPinned(v.id))
                .map(v => v.id);
        }
        getActivePaneComposite() {
            return this.getActiveComposite();
        }
        getLastActivePaneCompositeId() {
            return this.getLastActiveCompositeId();
        }
        hideActivePaneComposite() {
            // First check if panel is visible and hide if so
            if (this.layoutService.isVisible(this.partId)) {
                this.layoutService.setPartHidden(true, this.partId);
            }
            this.hideActiveComposite();
        }
        createTitleLabel(parent) {
            const titleArea = this.compositeBar.create(parent);
            titleArea.classList.add('panel-switcher-container');
            return {
                updateTitle: (id, title, keybinding) => {
                    const action = this.compositeBar.getAction(id);
                    if (action) {
                        action.label = title;
                    }
                },
                updateStyles: () => {
                    // Handled via theming participant
                }
            };
        }
        onTitleAreaUpdate(compositeId) {
            super.onTitleAreaUpdate(compositeId);
            // If title actions change, relayout the composite bar
            this.layoutCompositeBar();
        }
        layout(width, height, top, left) {
            if (!this.layoutService.isVisible(this.partId)) {
                return;
            }
            this.contentDimension = new dom_1.Dimension(width, height);
            // Layout contents
            super.layout(this.contentDimension.width, this.contentDimension.height, top, left);
            // Layout composite bar
            this.layoutCompositeBar();
            // Add empty panel message
            this.layoutEmptyMessage();
        }
        layoutCompositeBar() {
            if (this.contentDimension && this.dimension) {
                let availableWidth = this.contentDimension.width - 40; // take padding into account
                if (this.toolBar) {
                    availableWidth = Math.max(BasePanelPart_1.MIN_COMPOSITE_BAR_WIDTH, availableWidth - this.getToolbarWidth()); // adjust height for global actions showing
                }
                this.compositeBar.layout(new dom_1.Dimension(availableWidth, this.dimension.height));
            }
        }
        layoutEmptyMessage() {
            this.emptyPanelMessageElement?.classList.toggle('visible', this.compositeBar.getVisibleComposites().length === 0);
        }
        getViewContainer(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            return viewContainer && this.viewDescriptorService.getViewContainerLocation(viewContainer) === this.viewContainerLocation ? viewContainer : undefined;
        }
        updateGlobalToolbarActions() {
            const primaryActions = this.globalActions.getPrimaryActions();
            const secondaryActions = this.globalActions.getSecondaryActions();
            this.globalToolBar?.setActions((0, actionbar_1.prepareActions)(primaryActions), (0, actionbar_1.prepareActions)(secondaryActions));
        }
        getCompositeActions(compositeId) {
            let compositeActions = this.compositeActions.get(compositeId);
            if (!compositeActions) {
                // const panel = this.getPaneComposite(compositeId);
                const viewContainer = this.getViewContainer(compositeId);
                if (viewContainer) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    compositeActions = {
                        activityAction: this.instantiationService.createInstance(panelActions_1.PanelActivityAction, this.toActivity(viewContainerModel), this.viewContainerLocation),
                        pinnedAction: new compositeBarActions_1.ToggleCompositePinnedAction(this.toActivity(viewContainerModel), this.compositeBar),
                        badgeAction: new compositeBarActions_1.ToggleCompositeBadgeAction(this.toActivity(viewContainerModel), this.compositeBar)
                    };
                }
                else {
                    compositeActions = {
                        activityAction: this.instantiationService.createInstance(panelActions_1.PlaceHolderPanelActivityAction, compositeId, this.viewContainerLocation),
                        pinnedAction: new panelActions_1.PlaceHolderToggleCompositePinnedAction(compositeId, this.compositeBar),
                        badgeAction: new activitybarActions_1.PlaceHolderToggleCompositeBadgeAction(compositeId, this.compositeBar)
                    };
                }
                this.compositeActions.set(compositeId, compositeActions);
            }
            return compositeActions;
        }
        removeComposite(compositeId) {
            if (super.removeComposite(compositeId)) {
                this.compositeBar.removeComposite(compositeId);
                const compositeActions = this.compositeActions.get(compositeId);
                if (compositeActions) {
                    compositeActions.activityAction.dispose();
                    compositeActions.pinnedAction.dispose();
                    this.compositeActions.delete(compositeId);
                }
                return true;
            }
            return false;
        }
        getToolbarWidth() {
            const activePanel = this.getActivePaneComposite();
            if (!activePanel || !this.toolBar) {
                return 0;
            }
            return this.toolBar.getItemsWidth() + (this.globalToolBar?.getItemsWidth() ?? 0);
        }
        onDidStorageValueChange() {
            if (this.cachedPanelsValue !== this.getStoredCachedPanelsValue() /* This checks if current window changed the value or not */) {
                this._cachedPanelsValue = undefined;
                const newCompositeItems = [];
                const compositeItems = this.compositeBar.getCompositeBarItems();
                const cachedPanels = this.getCachedPanels();
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
                this.compositeBar.setCompositeBarItems(newCompositeItems);
            }
        }
        saveCachedPanels() {
            const state = [];
            const placeholders = [];
            const compositeItems = this.compositeBar.getCompositeBarItems();
            for (const compositeItem of compositeItems) {
                const viewContainer = this.getViewContainer(compositeItem.id);
                if (viewContainer) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    state.push({ id: compositeItem.id, name: viewContainerModel.title, pinned: compositeItem.pinned, order: compositeItem.order, visible: compositeItem.visible });
                    placeholders.push({ id: compositeItem.id, name: this.getCompositeActions(compositeItem.id).activityAction.label });
                }
                else {
                    state.push({ id: compositeItem.id, name: compositeItem.name, pinned: compositeItem.pinned, order: compositeItem.order, visible: compositeItem.visible });
                }
            }
            this.cachedPanelsValue = JSON.stringify(state);
            this.setPlaceholderViewContainers(placeholders);
        }
        getCachedPanels() {
            const registeredPanels = this.getPaneComposites();
            const storedStates = JSON.parse(this.cachedPanelsValue);
            const cachedPanels = storedStates.map(c => {
                const serialized = typeof c === 'string' /* migration from pinned states to composites states */ ? { id: c, pinned: true, order: undefined, visible: true } : c;
                const registered = registeredPanels.some(p => p.id === serialized.id);
                serialized.visible = registered ? (0, types_1.isUndefinedOrNull)(serialized.visible) ? true : serialized.visible : false;
                return serialized;
            });
            for (const placeholderViewContainer of this.getPlaceholderViewContainers()) {
                const cachedViewContainer = cachedPanels.filter(cached => cached.id === placeholderViewContainer.id)[0];
                if (cachedViewContainer) {
                    cachedViewContainer.name = placeholderViewContainer.name;
                }
            }
            return cachedPanels;
        }
        get cachedPanelsValue() {
            if (!this._cachedPanelsValue) {
                this._cachedPanelsValue = this.getStoredCachedPanelsValue();
            }
            return this._cachedPanelsValue;
        }
        set cachedPanelsValue(cachedViewletsValue) {
            if (this.cachedPanelsValue !== cachedViewletsValue) {
                this._cachedPanelsValue = cachedViewletsValue;
                this.setStoredCachedViewletsValue(cachedViewletsValue);
            }
        }
        getStoredCachedPanelsValue() {
            return this.storageService.get(this.pinnedPanelsKey, 0 /* StorageScope.PROFILE */, '[]');
        }
        setStoredCachedViewletsValue(value) {
            this.storageService.store(this.pinnedPanelsKey, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
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
            return this.storageService.get(this.placeholdeViewContainersKey, 1 /* StorageScope.WORKSPACE */, '[]');
        }
        setStoredPlaceholderViewContainersValue(value) {
            this.storageService.store(this.placeholdeViewContainersKey, value, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
    };
    exports.BasePanelPart = BasePanelPart;
    exports.BasePanelPart = BasePanelPart = BasePanelPart_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, storage_1.IStorageService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, views_1.IViewDescriptorService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, extensions_1.IExtensionService)
    ], BasePanelPart);
    let PanelPart = class PanelPart extends BasePanelPart {
        static { PanelPart_1 = this; }
        static { this.activePanelSettingsKey = 'workbench.panelpart.activepanelid'; }
        constructor(notificationService, storageService, telemetryService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService, menuService) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, "workbench.parts.panel" /* Parts.PANEL_PART */, PanelPart_1.activePanelSettingsKey, 'workbench.panel.pinnedPanels', 'workbench.panel.placeholderPanels', panecomposite_1.Extensions.Panels, theme_1.PANEL_BACKGROUND, 1 /* ViewContainerLocation.Panel */, contextkeys_1.ActivePanelContext.bindTo(contextKeyService), contextkeys_1.PanelFocusContext.bindTo(contextKeyService), {
                useIcons: false,
                hasTitle: true
            });
            this.commandService = commandService;
            this.menuService = menuService;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            const borderColor = this.getColor(theme_1.PANEL_BORDER) || this.getColor(colorRegistry_1.contrastBorder) || '';
            container.style.borderLeftColor = borderColor;
            container.style.borderRightColor = borderColor;
            const title = this.getTitleArea();
            if (title) {
                title.style.borderTopColor = this.getColor(theme_1.PANEL_BORDER) || this.getColor(colorRegistry_1.contrastBorder) || '';
            }
        }
        getActivityHoverOptions() {
            return {
                position: () => this.layoutService.getPanelPosition() === 2 /* Position.BOTTOM */ && !this.layoutService.isPanelMaximized() ? 3 /* HoverPosition.ABOVE */ : 2 /* HoverPosition.BELOW */,
            };
        }
        fillExtraContextMenuActions(actions) {
            const panelPositionMenu = this.menuService.createMenu(actions_3.MenuId.PanelPositionMenu, this.contextKeyService);
            const panelAlignMenu = this.menuService.createMenu(actions_3.MenuId.PanelAlignmentMenu, this.contextKeyService);
            const positionActions = [];
            const alignActions = [];
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(panelPositionMenu, { shouldForwardArgs: true }, { primary: [], secondary: positionActions });
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(panelAlignMenu, { shouldForwardArgs: true }, { primary: [], secondary: alignActions });
            panelAlignMenu.dispose();
            panelPositionMenu.dispose();
            actions.push(...[
                new actions_1.Separator(),
                new actions_1.SubmenuAction('workbench.action.panel.position', (0, nls_1.localize)('panel position', "Panel Position"), positionActions),
                new actions_1.SubmenuAction('workbench.action.panel.align', (0, nls_1.localize)('align panel', "Align Panel"), alignActions),
                (0, actions_1.toAction)({ id: panelActions_1.TogglePanelAction.ID, label: (0, nls_1.localize)('hidePanel', "Hide Panel"), run: () => this.commandService.executeCommand(panelActions_1.TogglePanelAction.ID) })
            ]);
        }
        layout(width, height, top, left) {
            let dimensions;
            if (this.layoutService.getPanelPosition() === 1 /* Position.RIGHT */) {
                dimensions = new dom_1.Dimension(width - 1, height); // Take into account the 1px border when layouting
            }
            else {
                dimensions = new dom_1.Dimension(width, height);
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
    exports.PanelPart = PanelPart;
    exports.PanelPart = PanelPart = PanelPart_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, storage_1.IStorageService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, themeService_1.IThemeService),
        __param(8, views_1.IViewDescriptorService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, extensions_1.IExtensionService),
        __param(11, commands_1.ICommandService),
        __param(12, actions_3.IMenuService)
    ], PanelPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWxQYXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvcGFuZWwvcGFuZWxQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFxRXpGLElBQWUsYUFBYSxHQUE1QixNQUFlLGFBQWMsU0FBUSw2QkFBNEI7O2lCQUMvQyw0QkFBdUIsR0FBRyxFQUFFLEFBQUwsQ0FBTTtRQVdyRCxJQUFJLElBQUk7WUFDUCwrQkFBK0I7WUFDL0IsaUVBQWlFO1lBQ2pFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFFRCxJQUFJLGVBQWU7WUFDbEIscURBQXFEO1lBQ3JELDBEQUEwRDtZQUMxRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDbEQsQ0FBQztRQUVELElBQUksY0FBYztZQUNqQixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUV0RCxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUNyQixPQUFPO2FBQ1A7WUFFRCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDaEQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQzlCLE9BQU87YUFDUDtZQUVELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELFlBQVk7UUFFWixJQUFJLHNCQUFzQixLQUE0QixPQUFPLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFpQixjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBc0JwSyxZQUN1QixtQkFBeUMsRUFDOUMsY0FBK0IsRUFDM0Isa0JBQXVDLEVBQ25DLGFBQXNDLEVBQzNDLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDbkQsWUFBMkIsRUFDbEIscUJBQThELEVBQ2xFLGlCQUF3RCxFQUN6RCxnQkFBb0QsRUFDdEQsTUFBa0QsRUFDbkUsc0JBQThCLEVBQ2IsZUFBdUIsRUFDdkIsMkJBQW1DLEVBQ3BELGVBQXVCLEVBQ04sZUFBdUIsRUFDdkIscUJBQTRDLEVBQzVDLHFCQUEwQyxFQUNuRCxvQkFBMEMsRUFDakMsWUFBK0I7WUFFaEQsS0FBSyxDQUNKLG1CQUFtQixFQUNuQixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsb0JBQW9CLEVBQ3BCLFlBQVksRUFDWixtQkFBUSxDQUFDLEVBQUUsQ0FBd0IsZUFBZSxDQUFDLEVBQ25ELHNCQUFzQixFQUN0QixxQkFBcUIsQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQzlFLE9BQU8sRUFDUCxPQUFPLEVBQ1AsU0FBUyxFQUNULE1BQU0sRUFDTixZQUFZLENBQ1osQ0FBQztZQTlCdUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUMvQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDdEQsV0FBTSxHQUFOLE1BQU0sQ0FBNEM7WUFFbEQsb0JBQWUsR0FBZixlQUFlLENBQVE7WUFDdkIsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUFRO1lBRW5DLG9CQUFlLEdBQWYsZUFBZSxDQUFRO1lBQ3ZCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUFxQjtZQUNuRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2pDLGlCQUFZLEdBQVosWUFBWSxDQUFtQjtZQTlFakQsZUFBZTtZQUVOLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1lBQzNCLGlCQUFZLEdBQVcsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1lBQ2hELGtCQUFhLEdBQVcsRUFBRSxDQUFDO1lBQzNCLGtCQUFhLEdBQVcsTUFBTSxDQUFDLGlCQUFpQixDQUFDO1lBZ0NqRCw0QkFBdUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBOEIsQ0FBQztZQUcxRSxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBdUksQ0FBQztZQUtsSyxxQkFBZ0IsR0FBNkIsSUFBSSxHQUFHLEVBQXVCLENBQUM7WUFFckYsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1lBRzFCLHlCQUFvQixHQUFHLEtBQUssQ0FBQztZQU1wQixxQ0FBZ0MsR0FBc0MsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUEwQzlILElBQUksQ0FBQyxhQUFhLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXdCLGVBQWUsQ0FBQyxDQUFDO1lBRXpFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUNoRyxDQUFDLEVBQVUsRUFBRSxLQUFlLEVBQUUsRUFBRSxDQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUF5QyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsRUFDeEksQ0FBQyxJQUFZLEVBQUUsRUFBVSxFQUFFLE1BQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLEVBQzdHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FDOUMsQ0FBQztZQUVGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJCQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO2dCQUNqSCxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUTtnQkFDbEMsV0FBVyx1Q0FBK0I7Z0JBQzFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDcEQsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7Z0JBQy9ILGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQWM7Z0JBQ3RGLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDLFlBQVk7Z0JBQzNGLHVCQUF1QixFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVc7Z0JBQ3pGLHlCQUF5QixFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxrQ0FBbUIsRUFBRSxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDO2dCQUN4TCwyQkFBMkIsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pGLGlDQUFpQyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFdBQVcsQ0FBQztnQkFDckcscUJBQXFCLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQXFCLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsRUFBRTtnQkFDMUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNuRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzNCLGFBQWEsRUFBRSxDQUFDO2dCQUNoQixrQkFBa0IsRUFBRSxFQUFFO2dCQUN0QixNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNqQixxQkFBcUIsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7b0JBQzNELHVCQUF1QixFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztvQkFDN0QsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQ0FBeUIsQ0FBQztvQkFDbEUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxxQ0FBNkIsQ0FBQztvQkFDcEUsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyx1Q0FBK0IsQ0FBQztvQkFDeEUsZUFBZSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsK0JBQWUsQ0FBQztvQkFDaEQsZUFBZSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsK0JBQWUsQ0FBQztvQkFDaEQsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxrQ0FBMEIsQ0FBQztpQkFDN0QsQ0FBQzthQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFeEQsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDhCQUFvQixFQUFFLE1BQU0sbURBQXFCLENBQUMsQ0FBQyxDQUFDLGdCQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxnQkFBTSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3RNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFLTyxpQ0FBaUMsQ0FBQyxXQUFtQjtZQUM1RCxNQUFNLE1BQU0sR0FBYyxFQUFFLENBQUM7WUFDN0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBRSxDQUFDO1lBQ3BGLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQywrQkFBK0IsQ0FBQyxhQUFhLENBQUUsQ0FBQztZQUNuRyxJQUFJLGVBQWUsS0FBSyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBQSxrQkFBUSxFQUFDLEVBQUUsRUFBRSxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLDJCQUEyQixDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM1TTtpQkFBTTtnQkFDTixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDM0YsSUFBSSxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN2RCxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBRSxDQUFDO29CQUM3RixJQUFJLGdCQUFnQixLQUFLLGFBQWEsRUFBRTt3QkFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFBLGtCQUFRLEVBQUMsRUFBRSxFQUFFLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUN0TTtpQkFDRDthQUNEO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sbUJBQW1CLENBQUMsTUFBaUM7WUFDNUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzVDLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO2dCQUMzQixNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQ2xELE1BQU0sUUFBUSxHQUNiLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRTtvQkFDakMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFFdEYsSUFBSSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLEVBQUU7b0JBRTVELGlCQUFpQjtvQkFDakIsTUFBTSxRQUFRLEdBQUc7d0JBQ2hCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTt3QkFDWixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7d0JBQ2hCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSzt3QkFDbEIsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjO3FCQUNwQyxDQUFDO29CQUVGLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUV6QyxpQ0FBaUM7b0JBQ2pDLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ2pCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDaEM7b0JBRUQsSUFBSSxRQUFRLEVBQUU7d0JBQ2IsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRTlDLGdFQUFnRTt3QkFDaEUsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTs0QkFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQzNCO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtnQkFDM0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUUsQ0FBQztnQkFDdkQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzNGLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFFaEUsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7Z0JBQzFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsZ0NBQWdDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFM0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ2pEO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxPQUFlO1lBQ2pELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEQsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO2lCQUN6RyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMscUJBQXFCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXBILElBQUksZ0JBQWdCLENBQUMsTUFBTSxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLE9BQU8sRUFBRTtvQkFDdkQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDMUcsTUFBTSxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNqRDthQUNEO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDcEQ7WUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyxjQUFjLENBQUMsYUFBNEIsRUFBRSxrQkFBdUM7WUFDM0YsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBRWhILE1BQU0sUUFBUSxHQUFjO2dCQUMzQixFQUFFLEVBQUUsYUFBYSxDQUFDLEVBQUU7Z0JBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsb0JBQW9CLElBQUksV0FBVyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXO2dCQUNyRyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsWUFBWTthQUM3QyxDQUFDO1lBRUYsTUFBTSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFFaEUsSUFBSSxZQUFZLFlBQVkscURBQXNDLEVBQUU7Z0JBQ25FLFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkM7WUFFRCx3RUFBd0U7WUFDeEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUUxQiwwRUFBMEU7WUFDMUUsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3hCO1FBQ0YsQ0FBQztRQUVPLFVBQVUsQ0FBQyxrQkFBdUM7WUFDekQsT0FBTyxlQUFhLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNuTSxDQUFDO1FBRU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFVLEVBQUUsSUFBWSxFQUFFLElBQWlDLEVBQUUsWUFBZ0M7WUFDdEgsSUFBSSxVQUFVLEdBQXlCLFNBQVMsQ0FBQztZQUNqRCxJQUFJLE9BQU8sR0FBb0IsU0FBUyxDQUFDO1lBQ3pDLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDZixNQUFNLE1BQU0sR0FBRyxJQUFBLGNBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxpQkFBVSxFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sTUFBTSxHQUFHLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3JFLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxTQUFTLEdBQUcsaUVBQWlFLE1BQU0sRUFBRSxDQUFDO2dCQUM1RixJQUFBLG1CQUFhLEVBQUMsU0FBUyxFQUFFO1lBQ2hCLE1BQU07O29CQUVFLE1BQU07Ozs7SUFJdEIsQ0FBQyxDQUFDO2FBQ0g7aUJBQU0sSUFBSSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdkMsVUFBVSxHQUFHLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUM7WUFFRCxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDO1FBQ3hELENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxhQUE0QixFQUFFLGtCQUF1QztZQUNwRyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQixVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxJQUFBLCtDQUFpQyxFQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDMUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3hFO1lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BELFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sYUFBYSxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztnQkFFcE8sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDakYsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQ2xELElBQUksZUFBZSxLQUFLLFNBQVMsSUFBSSxlQUFlLENBQUMsS0FBSyxFQUFFLEtBQUssYUFBYSxDQUFDLEVBQUUsRUFBRTt3QkFDbEYsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3REO2lCQUNEO2dCQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzthQUMxQjtpQkFBTSxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1FBQ0YsQ0FBQztRQUVPLGNBQWMsQ0FBQyxPQUFlLEVBQUUsV0FBMEI7WUFDakUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFO2dCQUNqRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsT0FBTyxXQUFXLEVBQUUsS0FBSyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDcEQsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQywyQkFBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNoSSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ1YsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QixxQkFBcUI7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1Rix5QkFBeUI7WUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5RSw0QkFBNEI7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXRFLHlCQUF5QjtZQUN6QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO2dCQUNqRSxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLCtCQUF1QixJQUFJLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN4SixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUwsQ0FBQztRQUVPLHVCQUF1QjtZQUM5QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1lBRWpDLHlCQUF5QjtZQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN4QyxLQUFLLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7Z0JBQzVDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7b0JBQzNDLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLGlDQUFpQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQUNyRSxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUN6Qjt5QkFBTTt3QkFDTixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUN2QjtpQkFDRDthQUNEO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVPLGFBQWEsQ0FBQyxXQUFtQjtZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUU3QyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEUsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDckIsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDMUM7UUFDRixDQUFDO1FBRU8sV0FBVyxDQUFDLEtBQWlCO1lBQ3BDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFOUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN0RSxJQUFJLFVBQVUsRUFBRTtnQkFDZixJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMzQztZQUVELGlDQUFpQztZQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDM0UsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksYUFBYSxFQUFFLFdBQVcsRUFBRTtvQkFDL0IsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzNGLElBQUksa0JBQWtCLENBQUMscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDMUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQ0FBcUM7cUJBQzdFO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLHdGQUF3RjtZQUNuSCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU8sWUFBWSxDQUFDLEtBQWlCO1lBQ3JDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUV6QixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNuQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVRLE1BQU0sQ0FBQyxNQUFtQjtZQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXJCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBRS9CLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSxnQkFBVSxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRU8sdUJBQXVCO1lBQzlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUcsQ0FBQztZQUMzQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBRXhFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckQsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNwRCxjQUFjLENBQUMsU0FBUyxHQUFHLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLDhCQUE4QixDQUFDLENBQUM7WUFFMUYsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxRCxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBRXZELElBQUksQ0FBQyxTQUFTLENBQUMsa0NBQTRCLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ2xHLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUNqQixpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNwQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQy9GLElBQUEsc0JBQWdCLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUNyRSxDQUFDO2dCQUNELFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUNsQixpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUVwQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQy9GLElBQUksQ0FBQyx3QkFBeUIsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsdUNBQStCLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdEosQ0FBQztnQkFDRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDbEIsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLHdCQUF5QixDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO2dCQUMzRCxDQUFDO2dCQUNELFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUNoQixpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsd0JBQXlCLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7Z0JBQzNELENBQUM7Z0JBQ0QsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7b0JBQ2IsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLHdCQUF5QixDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO29CQUUxRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7YUFDRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFbUIsZUFBZSxDQUFDLE1BQW1CO1lBQ3RELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUMsTUFBTSwyQkFBMkIsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUEsT0FBQyxFQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUU5RSx5QkFBeUI7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksaUJBQU8sQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3JHLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQztnQkFDckUsV0FBVyx1Q0FBK0I7Z0JBQzFDLGFBQWEsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUMzRSx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLEVBQUU7Z0JBQ3pFLGVBQWUsRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsaUJBQWlCLENBQUM7YUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUVsQyxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRVEsWUFBWTtZQUNwQixLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFckIsTUFBTSxTQUFTLEdBQUcsSUFBQSx1QkFBZSxFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM1RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLDhCQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEQsU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsV0FBVyxDQUFDO1lBQzlDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO1lBRS9DLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQyxJQUFJLEtBQUssRUFBRTtnQkFDVixLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLDhCQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDakU7UUFDRixDQUFDO1FBRUQsV0FBVyxDQUFDLEVBQVUsRUFBRSxLQUFlO1lBQ3RDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUMzQixPQUFPLFNBQVMsQ0FBQyxDQUFDLGdEQUFnRDthQUNsRTtZQUVELGdEQUFnRDtZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMvQyxJQUFJO29CQUNILElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7b0JBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3JEO3dCQUFTO29CQUNULElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7aUJBQy9CO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBa0IsQ0FBQztRQUN2RCxDQUFDO1FBRUQsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQVcsRUFBRSxLQUFlO1lBQ25ELElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDeEQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNuQztZQUVELE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxFQUFFLENBQUM7WUFFaEUsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN4RCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ25DO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELFlBQVksQ0FBQyxPQUFlLEVBQUUsS0FBYSxFQUFFLEtBQWM7WUFDMUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxPQUFlO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsaUJBQWlCO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRTtpQkFDM0MsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO2dCQUNoQixJQUFJLE9BQU8sRUFBRSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7b0JBQ2pDLE9BQU8sQ0FBQyxDQUFDO2lCQUNUO2dCQUVELElBQUksT0FBTyxFQUFFLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtvQkFDakMsT0FBTyxDQUFDLENBQUMsQ0FBQztpQkFDVjtnQkFFRCxPQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCx5QkFBeUI7WUFDeEIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFO2lCQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM5QyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3ZGLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBRUQsMEJBQTBCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRTtpQkFDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2hHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBRUQsc0JBQXNCO1lBQ3JCLE9BQXVCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2xELENBQUM7UUFFRCw0QkFBNEI7WUFDM0IsT0FBTyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRUQsdUJBQXVCO1lBQ3RCLGlEQUFpRDtZQUNqRCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNwRDtZQUVELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFa0IsZ0JBQWdCLENBQUMsTUFBbUI7WUFDdEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUVwRCxPQUFPO2dCQUNOLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEVBQUU7b0JBQ3RDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLE1BQU0sRUFBRTt3QkFDWCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztxQkFDckI7Z0JBQ0YsQ0FBQztnQkFDRCxZQUFZLEVBQUUsR0FBRyxFQUFFO29CQUNsQixrQ0FBa0M7Z0JBQ25DLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxXQUFtQjtZQUN2RCxLQUFLLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckMsc0RBQXNEO1lBQ3RELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFUSxNQUFNLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBWTtZQUN2RSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMvQyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxlQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXJELGtCQUFrQjtZQUNsQixLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbkYsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBRTFCLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLElBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQzVDLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsNEJBQTRCO2dCQUNuRixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWEsQ0FBQyx1QkFBdUIsRUFBRSxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7aUJBQ3RKO2dCQUVELElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksZUFBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDL0U7UUFDRixDQUFDO1FBR08sa0JBQWtCO1lBQ3pCLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25ILENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxFQUFVO1lBQ2xDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxRSxPQUFPLGFBQWEsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN2SixDQUFDO1FBRU8sMEJBQTBCO1lBQ2pDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM5RCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUVsRSxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxJQUFBLDBCQUFjLEVBQUMsY0FBYyxDQUFDLEVBQUUsSUFBQSwwQkFBYyxFQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBRU8sbUJBQW1CLENBQUMsV0FBbUI7WUFDOUMsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDdEIsb0RBQW9EO2dCQUNwRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRXpELElBQUksYUFBYSxFQUFFO29CQUNsQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDM0YsZ0JBQWdCLEdBQUc7d0JBQ2xCLGNBQWMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGtDQUFtQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUM7d0JBQzlJLFlBQVksRUFBRSxJQUFJLGlEQUEyQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDO3dCQUNyRyxXQUFXLEVBQUUsSUFBSSxnREFBMEIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQztxQkFDbkcsQ0FBQztpQkFDRjtxQkFBTTtvQkFDTixnQkFBZ0IsR0FBRzt3QkFDbEIsY0FBYyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNkNBQThCLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQzt3QkFDakksWUFBWSxFQUFFLElBQUkscURBQXNDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUM7d0JBQ3hGLFdBQVcsRUFBRSxJQUFJLDBEQUFxQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDO3FCQUN0RixDQUFDO2lCQUNGO2dCQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7YUFDekQ7WUFFRCxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFa0IsZUFBZSxDQUFDLFdBQW1CO1lBQ3JELElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxnQkFBZ0IsRUFBRTtvQkFDckIsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUMxQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQzFDO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFUyxlQUFlO1lBQ3hCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRU8sdUJBQXVCO1lBQzlCLElBQUksSUFBSSxDQUFDLGlCQUFpQixLQUFLLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLDREQUE0RCxFQUFFO2dCQUM5SCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO2dCQUNwQyxNQUFNLGlCQUFpQixHQUF3QixFQUFFLENBQUM7Z0JBQ2xELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDaEUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUU1QyxLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRTtvQkFDdkMsa0NBQWtDO29CQUNsQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7d0JBQ3RCLEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRTt3QkFDbEIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJO3dCQUN0QixLQUFLLEVBQUUsV0FBVyxDQUFDLEtBQUs7d0JBQ3hCLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTTt3QkFDMUIsT0FBTyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLFdBQVcsQ0FBQyxFQUFFLENBQUM7cUJBQ2pFLENBQUMsQ0FBQztpQkFDSDtnQkFFRCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDM0Qsd0RBQXdEO29CQUN4RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTt3QkFDekUsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7cUJBQzFEO2lCQUNEO2dCQUVELElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUMxRDtRQUNGLENBQUM7UUFFTyxnQkFBZ0I7WUFDdkIsTUFBTSxLQUFLLEdBQW1CLEVBQUUsQ0FBQztZQUNqQyxNQUFNLFlBQVksR0FBZ0MsRUFBRSxDQUFDO1lBRXJELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNoRSxLQUFLLE1BQU0sYUFBYSxJQUFJLGNBQWMsRUFBRTtnQkFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxhQUFhLEVBQUU7b0JBQ2xCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUMzRixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQy9KLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDbkg7cUJBQU07b0JBQ04sS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztpQkFDeko7YUFDRDtZQUVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRU8sZUFBZTtZQUN0QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRWxELE1BQU0sWUFBWSxHQUFpQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pDLE1BQU0sVUFBVSxHQUFpQixPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsdURBQXVELENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlLLE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RSxVQUFVLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBQSx5QkFBaUIsRUFBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUM1RyxPQUFPLFVBQVUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUVILEtBQUssTUFBTSx3QkFBd0IsSUFBSSxJQUFJLENBQUMsNEJBQTRCLEVBQUUsRUFBRTtnQkFDM0UsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEcsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsbUJBQW1CLENBQUMsSUFBSSxHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQztpQkFDekQ7YUFDRDtZQUVELE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFHRCxJQUFZLGlCQUFpQjtZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUM3QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7YUFDNUQ7WUFFRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBWSxpQkFBaUIsQ0FBQyxtQkFBMkI7WUFDeEQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssbUJBQW1CLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDdkQ7UUFDRixDQUFDO1FBRU8sMEJBQTBCO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsZ0NBQXdCLElBQUksQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFTyw0QkFBNEIsQ0FBQyxLQUFhO1lBQ2pELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSywyREFBMkMsQ0FBQztRQUNsRyxDQUFDO1FBRU8sNEJBQTRCO1lBQ25DLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRU8sNEJBQTRCLENBQUMseUJBQXNEO1lBQzFGLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDakYsQ0FBQztRQUdELElBQVksOEJBQThCO1lBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUU7Z0JBQzFDLElBQUksQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUMsdUNBQXVDLEVBQUUsQ0FBQzthQUN0RjtZQUVELE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDO1FBQzdDLENBQUM7UUFFRCxJQUFZLDhCQUE4QixDQUFDLDZCQUFxQztZQUMvRSxJQUFJLElBQUksQ0FBQyw4QkFBOEIsS0FBSyw2QkFBNkIsRUFBRTtnQkFDMUUsSUFBSSxDQUFDLCtCQUErQixHQUFHLDZCQUE2QixDQUFDO2dCQUNyRSxJQUFJLENBQUMsdUNBQXVDLENBQUMsNkJBQTZCLENBQUMsQ0FBQzthQUM1RTtRQUNGLENBQUM7UUFFTyx1Q0FBdUM7WUFDOUMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLGtDQUEwQixJQUFJLENBQUMsQ0FBQztRQUNoRyxDQUFDO1FBRU8sdUNBQXVDLENBQUMsS0FBYTtZQUM1RCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxnRUFBZ0QsQ0FBQztRQUNuSCxDQUFDOztJQXYwQm9CLHNDQUFhOzRCQUFiLGFBQWE7UUFnRWhDLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLHVDQUF1QixDQUFBO1FBQ3ZCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLDRCQUFhLENBQUE7UUFDYixXQUFBLDhCQUFzQixDQUFBO1FBQ3RCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSw4QkFBaUIsQ0FBQTtPQXpFRSxhQUFhLENBdzBCbEM7SUFFTSxJQUFNLFNBQVMsR0FBZixNQUFNLFNBQVUsU0FBUSxhQUFhOztpQkFDM0IsMkJBQXNCLEdBQUcsbUNBQW1DLEFBQXRDLENBQXVDO1FBRTdFLFlBQ3VCLG1CQUF5QyxFQUM5QyxjQUErQixFQUM3QixnQkFBbUMsRUFDakMsa0JBQXVDLEVBQ25DLGFBQXNDLEVBQzNDLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDbkQsWUFBMkIsRUFDbEIscUJBQTZDLEVBQ2pELGlCQUFxQyxFQUN0QyxnQkFBbUMsRUFDN0IsY0FBK0IsRUFDbEMsV0FBeUI7WUFFL0MsS0FBSyxDQUNKLG1CQUFtQixFQUNuQixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsb0JBQW9CLEVBQ3BCLFlBQVksRUFDWixxQkFBcUIsRUFDckIsaUJBQWlCLEVBQ2pCLGdCQUFnQixrREFFaEIsV0FBUyxDQUFDLHNCQUFzQixFQUNoQyw4QkFBOEIsRUFDOUIsbUNBQW1DLEVBQ25DLDBCQUF1QixDQUFDLE1BQU0sRUFDOUIsd0JBQWdCLHVDQUVoQixnQ0FBa0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFDNUMsK0JBQWlCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQzNDO2dCQUNDLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFFBQVEsRUFBRSxJQUFJO2FBQ2QsQ0FDRCxDQUFDO1lBM0J1QixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUEyQmhELENBQUM7UUFFUSxZQUFZO1lBQ3BCLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVyQixNQUFNLFNBQVMsR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDdkQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBWSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBYyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZGLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFdBQVcsQ0FBQztZQUM5QyxTQUFTLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBWSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBYyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2hHO1FBQ0YsQ0FBQztRQUVTLHVCQUF1QjtZQUNoQyxPQUFPO2dCQUNOLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLDRCQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsNkJBQXFCLENBQUMsNEJBQW9CO2FBQy9KLENBQUM7UUFDSCxDQUFDO1FBRVMsMkJBQTJCLENBQUMsT0FBa0I7WUFFdkQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBTSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3hHLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGdCQUFNLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdEcsTUFBTSxlQUFlLEdBQWMsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sWUFBWSxHQUFjLEVBQUUsQ0FBQztZQUNuQyxJQUFBLDJEQUFpQyxFQUFDLGlCQUFpQixFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQy9ILElBQUEsMkRBQWlDLEVBQUMsY0FBYyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQ3pILGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN6QixpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUU1QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUc7Z0JBQ2YsSUFBSSxtQkFBUyxFQUFFO2dCQUNmLElBQUksdUJBQWEsQ0FBQyxpQ0FBaUMsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLGVBQWUsQ0FBQztnQkFDbkgsSUFBSSx1QkFBYSxDQUFDLDhCQUE4QixFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsRUFBRSxZQUFZLENBQUM7Z0JBQ3ZHLElBQUEsa0JBQVEsRUFBQyxFQUFFLEVBQUUsRUFBRSxnQ0FBaUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsZ0NBQWlCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUN2SixDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsTUFBTSxDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsR0FBVyxFQUFFLElBQVk7WUFDdkUsSUFBSSxVQUFxQixDQUFDO1lBQzFCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBbUIsRUFBRTtnQkFDN0QsVUFBVSxHQUFHLElBQUksZUFBUyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxrREFBa0Q7YUFDakc7aUJBQU07Z0JBQ04sVUFBVSxHQUFHLElBQUksZUFBUyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzthQUMxQztZQUVELGtCQUFrQjtZQUNsQixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELE1BQU07WUFDTCxPQUFPO2dCQUNOLElBQUksZ0RBQWtCO2FBQ3RCLENBQUM7UUFDSCxDQUFDOztJQXBHVyw4QkFBUzt3QkFBVCxTQUFTO1FBSW5CLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsdUNBQXVCLENBQUE7UUFDdkIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsOEJBQXNCLENBQUE7UUFDdEIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixZQUFBLDhCQUFpQixDQUFBO1FBQ2pCLFlBQUEsMEJBQWUsQ0FBQTtRQUNmLFlBQUEsc0JBQVksQ0FBQTtPQWhCRixTQUFTLENBcUdyQiJ9