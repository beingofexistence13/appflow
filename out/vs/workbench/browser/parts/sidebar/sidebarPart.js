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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/compositePart", "vs/workbench/browser/panecomposite", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/common/contextkeys", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/platform/notification/common/notification", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/extensions/common/extensions", "vs/base/common/types", "vs/workbench/browser/dnd", "vs/workbench/common/views", "vs/base/browser/touch", "vs/css!./media/sidebarpart", "vs/workbench/browser/parts/sidebar/sidebarActions"], function (require, exports, platform_1, compositePart_1, panecomposite_1, layoutService_1, contextkeys_1, storage_1, contextView_1, keybinding_1, instantiation_1, event_1, themeService_1, colorRegistry_1, theme_1, notification_1, dom_1, mouseEvent_1, contextkey_1, extensions_1, types_1, dnd_1, views_1, touch_1) {
    "use strict";
    var SidebarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SidebarPart = void 0;
    let SidebarPart = class SidebarPart extends compositePart_1.CompositePart {
        static { SidebarPart_1 = this; }
        static { this.activeViewletSettingsKey = 'workbench.sidebar.activeviewletid'; }
        get preferredWidth() {
            const viewlet = this.getActivePaneComposite();
            if (!viewlet) {
                return;
            }
            const width = viewlet.getOptimalWidth();
            if (typeof width !== 'number') {
                return;
            }
            return Math.max(width, 300);
        }
        //#endregion
        get onDidPaneCompositeRegister() { return this.viewletRegistry.onDidRegister; }
        get onDidPaneCompositeOpen() { return event_1.Event.map(this.onDidCompositeOpen.event, compositeEvent => compositeEvent.composite); }
        get onDidPaneCompositeClose() { return this.onDidCompositeClose.event; }
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, platform_1.Registry.as(panecomposite_1.Extensions.Viewlets), SidebarPart_1.activeViewletSettingsKey, viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */).id, 'sideBar', 'viewlet', theme_1.SIDE_BAR_TITLE_FOREGROUND, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, { hasTitle: true, borderWidth: () => (this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder)) ? 1 : 0 });
            this.viewDescriptorService = viewDescriptorService;
            this.contextKeyService = contextKeyService;
            this.extensionService = extensionService;
            //#region IView
            this.minimumWidth = 170;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.priority = 1 /* LayoutPriority.Low */;
            this.snap = true;
            this._onDidViewletDeregister = this._register(new event_1.Emitter());
            this.onDidPaneCompositeDeregister = this._onDidViewletDeregister.event;
            this.viewletRegistry = platform_1.Registry.as(panecomposite_1.Extensions.Viewlets);
            this.sideBarFocusContextKey = contextkeys_1.SidebarFocusContext.bindTo(this.contextKeyService);
            this.activeViewletContextKey = contextkeys_1.ActiveViewletContext.bindTo(this.contextKeyService);
            this.blockOpeningViewlet = false;
            this.registerListeners();
        }
        registerListeners() {
            // Viewlet open
            this._register(this.onDidPaneCompositeOpen(viewlet => {
                this.activeViewletContextKey.set(viewlet.getId());
            }));
            // Viewlet close
            this._register(this.onDidPaneCompositeClose(viewlet => {
                if (this.activeViewletContextKey.get() === viewlet.getId()) {
                    this.activeViewletContextKey.reset();
                }
            }));
            // Viewlet deregister
            this._register(this.registry.onDidDeregister(async (viewletDescriptor) => {
                const activeContainers = this.viewDescriptorService.getViewContainersByLocation(0 /* ViewContainerLocation.Sidebar */)
                    .filter(container => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
                if (activeContainers.length) {
                    if (this.getActiveComposite()?.getId() === viewletDescriptor.id) {
                        const defaultViewletId = this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id;
                        const containerToOpen = activeContainers.filter(c => c.id === defaultViewletId)[0] || activeContainers[0];
                        await this.openPaneComposite(containerToOpen.id);
                    }
                }
                else {
                    this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                }
                this.removeComposite(viewletDescriptor.id);
                this._onDidViewletDeregister.fire(viewletDescriptor);
            }));
        }
        create(parent) {
            this.element = parent;
            super.create(parent);
            const focusTracker = this._register((0, dom_1.trackFocus)(parent));
            this._register(focusTracker.onDidFocus(() => this.sideBarFocusContextKey.set(true)));
            this._register(focusTracker.onDidBlur(() => this.sideBarFocusContextKey.set(false)));
        }
        createTitleArea(parent) {
            const titleArea = super.createTitleArea(parent);
            this._register((0, dom_1.addDisposableListener)(titleArea, dom_1.EventType.CONTEXT_MENU, e => {
                this.onTitleAreaContextMenu(new mouseEvent_1.StandardMouseEvent(e));
            }));
            this._register(touch_1.Gesture.addTarget(titleArea));
            this._register((0, dom_1.addDisposableListener)(titleArea, touch_1.EventType.Contextmenu, e => {
                this.onTitleAreaContextMenu(new mouseEvent_1.StandardMouseEvent(e));
            }));
            this.titleLabelElement.draggable = true;
            const draggedItemProvider = () => {
                const activeViewlet = this.getActivePaneComposite();
                return { type: 'composite', id: activeViewlet.getId() };
            };
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.titleLabelElement, draggedItemProvider, {}));
            return titleArea;
        }
        updateStyles() {
            super.updateStyles();
            // Part container
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            container.style.backgroundColor = this.getColor(theme_1.SIDE_BAR_BACKGROUND) || '';
            container.style.color = this.getColor(theme_1.SIDE_BAR_FOREGROUND) || '';
            const borderColor = this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            const isPositionLeft = this.layoutService.getSideBarPosition() === 0 /* SideBarPosition.LEFT */;
            container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '';
            container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : '';
            container.style.borderRightColor = isPositionLeft ? borderColor || '' : '';
            container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '';
            container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : '';
            container.style.borderLeftColor = !isPositionLeft ? borderColor || '' : '';
            container.style.outlineColor = this.getColor(theme_1.SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? '';
        }
        layout(width, height, top, left) {
            if (!this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                return;
            }
            super.layout(width, height, top, left);
        }
        // Viewlet service
        getActivePaneComposite() {
            return this.getActiveComposite();
        }
        getLastActivePaneCompositeId() {
            return this.getLastActiveCompositeId();
        }
        hideActivePaneComposite() {
            this.hideActiveComposite();
        }
        async openPaneComposite(id, focus) {
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenViewlet(id, focus);
            }
            await this.extensionService.whenInstalledExtensionsRegistered();
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenViewlet(id, focus);
            }
            return undefined;
        }
        getPaneComposites() {
            return this.viewletRegistry.getPaneComposites().sort((v1, v2) => {
                if (typeof v1.order !== 'number') {
                    return -1;
                }
                if (typeof v2.order !== 'number') {
                    return 1;
                }
                return v1.order - v2.order;
            });
        }
        getPaneComposite(id) {
            return this.getPaneComposites().filter(viewlet => viewlet.id === id)[0];
        }
        doOpenViewlet(id, focus) {
            if (this.blockOpeningViewlet) {
                return undefined; // Workaround against a potential race condition
            }
            // First check if sidebar is hidden and show if so
            if (!this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                try {
                    this.blockOpeningViewlet = true;
                    this.layoutService.setPartHidden(false, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                }
                finally {
                    this.blockOpeningViewlet = false;
                }
            }
            return this.openComposite(id, focus);
        }
        getTitleAreaDropDownAnchorAlignment() {
            return this.layoutService.getSideBarPosition() === 0 /* SideBarPosition.LEFT */ ? 0 /* AnchorAlignment.LEFT */ : 1 /* AnchorAlignment.RIGHT */;
        }
        onTitleAreaContextMenu(event) {
            const activeViewlet = this.getActivePaneComposite();
            if (activeViewlet) {
                const contextMenuActions = activeViewlet ? activeViewlet.getContextMenuActions() : [];
                if (contextMenuActions.length) {
                    this.contextMenuService.showContextMenu({
                        getAnchor: () => event,
                        getActions: () => contextMenuActions.slice(),
                        getActionViewItem: action => this.actionViewItemProvider(action),
                        actionRunner: activeViewlet.getActionRunner(),
                        skipTelemetry: true
                    });
                }
            }
        }
        toJSON() {
            return {
                type: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */
            };
        }
    };
    exports.SidebarPart = SidebarPart;
    exports.SidebarPart = SidebarPart = SidebarPart_1 = __decorate([
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
    ], SidebarPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhclBhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9zaWRlYmFyL3NpZGViYXJQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQnpGLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVksU0FBUSw2QkFBNEI7O2lCQUk1Qyw2QkFBd0IsR0FBRyxtQ0FBbUMsQUFBdEMsQ0FBdUM7UUFhL0UsSUFBSSxjQUFjO1lBQ2pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBRTlDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsT0FBTzthQUNQO1lBRUQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3hDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUM5QixPQUFPO2FBQ1A7WUFFRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCxZQUFZO1FBRVosSUFBSSwwQkFBMEIsS0FBcUMsT0FBdUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBSy9JLElBQUksc0JBQXNCLEtBQTRCLE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxFQUFFLENBQWlCLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEssSUFBSSx1QkFBdUIsS0FBNEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBOEIsQ0FBQyxDQUFDLENBQUM7UUFTeEgsWUFDdUIsbUJBQXlDLEVBQzlDLGNBQStCLEVBQzNCLGtCQUF1QyxFQUNuQyxhQUFzQyxFQUMz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