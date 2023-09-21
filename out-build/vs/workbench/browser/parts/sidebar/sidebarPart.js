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
    var $0xb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0xb = void 0;
    let $0xb = class $0xb extends compositePart_1.$5xb {
        static { $0xb_1 = this; }
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
        get onDidPaneCompositeRegister() { return this.Gb.onDidRegister; }
        get onDidPaneCompositeOpen() { return event_1.Event.map(this.a.event, compositeEvent => compositeEvent.composite); }
        get onDidPaneCompositeClose() { return this.b.event; }
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, Kb, Lb, Mb) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, platform_1.$8m.as(panecomposite_1.$Web.Viewlets), $0xb_1.activeViewletSettingsKey, Kb.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */).id, 'sideBar', 'viewlet', theme_1.$Lab, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, { hasTitle: true, borderWidth: () => (this.z(theme_1.$Kab) || this.z(colorRegistry_1.$Av)) ? 1 : 0 });
            this.Kb = Kb;
            this.Lb = Lb;
            this.Mb = Mb;
            //#region IView
            this.minimumWidth = 170;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.priority = 1 /* LayoutPriority.Low */;
            this.snap = true;
            this.Fb = this.B(new event_1.$fd());
            this.onDidPaneCompositeDeregister = this.Fb.event;
            this.Gb = platform_1.$8m.as(panecomposite_1.$Web.Viewlets);
            this.Hb = contextkeys_1.$rdb.bindTo(this.Lb);
            this.Ib = contextkeys_1.$sdb.bindTo(this.Lb);
            this.Jb = false;
            this.Nb();
        }
        Nb() {
            // Viewlet open
            this.B(this.onDidPaneCompositeOpen(viewlet => {
                this.Ib.set(viewlet.getId());
            }));
            // Viewlet close
            this.B(this.onDidPaneCompositeClose(viewlet => {
                if (this.Ib.get() === viewlet.getId()) {
                    this.Ib.reset();
                }
            }));
            // Viewlet deregister
            this.B(this.ib.onDidDeregister(async (viewletDescriptor) => {
                const activeContainers = this.Kb.getViewContainersByLocation(0 /* ViewContainerLocation.Sidebar */)
                    .filter(container => this.Kb.getViewContainerModel(container).activeViewDescriptors.length > 0);
                if (activeContainers.length) {
                    if (this.vb()?.getId() === viewletDescriptor.id) {
                        const defaultViewletId = this.Kb.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id;
                        const containerToOpen = activeContainers.filter(c => c.id === defaultViewletId)[0] || activeContainers[0];
                        await this.openPaneComposite(containerToOpen.id);
                    }
                }
                else {
                    this.u.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                }
                this.Eb(viewletDescriptor.id);
                this.Fb.fire(viewletDescriptor);
            }));
        }
        create(parent) {
            this.element = parent;
            super.create(parent);
            const focusTracker = this.B((0, dom_1.$8O)(parent));
            this.B(focusTracker.onDidFocus(() => this.Hb.set(true)));
            this.B(focusTracker.onDidBlur(() => this.Hb.set(false)));
        }
        I(parent) {
            const titleArea = super.I(parent);
            this.B((0, dom_1.$nO)(titleArea, dom_1.$3O.CONTEXT_MENU, e => {
                this.Rb(new mouseEvent_1.$eO(e));
            }));
            this.B(touch_1.$EP.addTarget(titleArea));
            this.B((0, dom_1.$nO)(titleArea, touch_1.EventType.Contextmenu, e => {
                this.Rb(new mouseEvent_1.$eO(e));
            }));
            this.P.draggable = true;
            const draggedItemProvider = () => {
                const activeViewlet = this.getActivePaneComposite();
                return { type: 'composite', id: activeViewlet.getId() };
            };
            this.B(dnd_1.$zeb.INSTANCE.registerDraggable(this.P, draggedItemProvider, {}));
            return titleArea;
        }
        updateStyles() {
            super.updateStyles();
            // Part container
            const container = (0, types_1.$uf)(this.getContainer());
            container.style.backgroundColor = this.z(theme_1.$Iab) || '';
            container.style.color = this.z(theme_1.$Jab) || '';
            const borderColor = this.z(theme_1.$Kab) || this.z(colorRegistry_1.$Av);
            const isPositionLeft = this.u.getSideBarPosition() === 0 /* SideBarPosition.LEFT */;
            container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '';
            container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : '';
            container.style.borderRightColor = isPositionLeft ? borderColor || '' : '';
            container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '';
            container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : '';
            container.style.borderLeftColor = !isPositionLeft ? borderColor || '' : '';
            container.style.outlineColor = this.z(theme_1.$Mab) ?? '';
        }
        layout(width, height, top, left) {
            if (!this.u.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                return;
            }
            super.layout(width, height, top, left);
        }
        // Viewlet service
        getActivePaneComposite() {
            return this.vb();
        }
        getLastActivePaneCompositeId() {
            return this.wb();
        }
        hideActivePaneComposite() {
            this.xb();
        }
        async openPaneComposite(id, focus) {
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.Pb(id, focus);
            }
            await this.Mb.whenInstalledExtensionsRegistered();
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.Pb(id, focus);
            }
            return undefined;
        }
        getPaneComposites() {
            return this.Gb.getPaneComposites().sort((v1, v2) => {
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
        Pb(id, focus) {
            if (this.Jb) {
                return undefined; // Workaround against a potential race condition
            }
            // First check if sidebar is hidden and show if so
            if (!this.u.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                try {
                    this.Jb = true;
                    this.u.setPartHidden(false, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                }
                finally {
                    this.Jb = false;
                }
            }
            return this.ob(id, focus);
        }
        Db() {
            return this.u.getSideBarPosition() === 0 /* SideBarPosition.LEFT */ ? 0 /* AnchorAlignment.LEFT */ : 1 /* AnchorAlignment.RIGHT */;
        }
        Rb(event) {
            const activeViewlet = this.getActivePaneComposite();
            if (activeViewlet) {
                const contextMenuActions = activeViewlet ? activeViewlet.getContextMenuActions() : [];
                if (contextMenuActions.length) {
                    this.fb.showContextMenu({
                        getAnchor: () => event,
                        getActions: () => contextMenuActions.slice(),
                        getActionViewItem: action => this.Ab(action),
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
    exports.$0xb = $0xb;
    exports.$0xb = $0xb = $0xb_1 = __decorate([
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
    ], $0xb);
});
//# sourceMappingURL=sidebarPart.js.map