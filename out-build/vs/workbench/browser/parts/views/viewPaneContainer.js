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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/browser/ui/splitview/paneview", "vs/base/common/async", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls!vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions", "vs/workbench/browser/dnd", "vs/workbench/common/component", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/css!./media/paneviewlet"], function (require, exports, dom_1, mouseEvent_1, touch_1, paneview_1, async_1, event_1, keyCodes_1, lifecycle_1, types_1, nls, menuEntryActionViewItem_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, workspace_1, actions_2, dnd_1, component_1, theme_1, views_1, contextkeys_1, extensions_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Teb = exports.$Seb = exports.$Reb = void 0;
    exports.$Reb = new actions_1.$Ru('Views');
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ViewContainerTitle, {
        submenu: exports.$Reb,
        title: nls.localize(0, null),
        order: 1,
        when: contextkey_1.$Ii.equals('viewContainerLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */)),
    });
    var DropDirection;
    (function (DropDirection) {
        DropDirection[DropDirection["UP"] = 0] = "UP";
        DropDirection[DropDirection["DOWN"] = 1] = "DOWN";
        DropDirection[DropDirection["LEFT"] = 2] = "LEFT";
        DropDirection[DropDirection["RIGHT"] = 3] = "RIGHT";
    })(DropDirection || (DropDirection = {}));
    class ViewPaneDropOverlay extends themeService_1.$nv {
        static { this.c = 'monaco-pane-drop-overlay'; }
        get currentDropOperation() {
            return this.j;
        }
        constructor(s, t, u, C, themeService) {
            super(themeService);
            this.s = s;
            this.t = t;
            this.u = u;
            this.C = C;
            this.r = this.B(new async_1.$Sg(() => this.dispose(), 300));
            this.D();
        }
        get disposed() {
            return !!this.m;
        }
        D() {
            // Container
            this.f = document.createElement('div');
            this.f.id = ViewPaneDropOverlay.c;
            this.f.style.top = '0px';
            // Parent
            this.s.appendChild(this.f);
            this.s.classList.add('dragged-over');
            this.B((0, lifecycle_1.$ic)(() => {
                this.s.removeChild(this.f);
                this.s.classList.remove('dragged-over');
            }));
            // Overlay
            this.g = document.createElement('div');
            this.g.classList.add('pane-overlay-indicator');
            this.f.appendChild(this.g);
            // Overlay Event Handling
            this.F();
            // Styles
            this.updateStyles();
        }
        updateStyles() {
            // Overlay drop background
            this.g.style.backgroundColor = this.z(this.C === 1 /* ViewContainerLocation.Panel */ ? theme_1.$S_ : theme_1.$Mab) || '';
            // Overlay contrast border (if any)
            const activeContrastBorderColor = this.z(colorRegistry_1.$Bv);
            this.g.style.outlineColor = activeContrastBorderColor || '';
            this.g.style.outlineOffset = activeContrastBorderColor ? '-2px' : '';
            this.g.style.outlineStyle = activeContrastBorderColor ? 'dashed' : '';
            this.g.style.outlineWidth = activeContrastBorderColor ? '2px' : '';
            this.g.style.borderColor = activeContrastBorderColor || '';
            this.g.style.borderStyle = 'solid' || '';
            this.g.style.borderWidth = '0px';
        }
        F() {
            this.B(new dom_1.$zP(this.f, {
                onDragEnter: e => undefined,
                onDragOver: e => {
                    // Position overlay
                    this.G(e.offsetX, e.offsetY);
                    // Make sure to stop any running cleanup scheduler to remove the overlay
                    if (this.r.isScheduled()) {
                        this.r.cancel();
                    }
                },
                onDragLeave: e => this.dispose(),
                onDragEnd: e => this.dispose(),
                onDrop: e => {
                    // Dispose overlay
                    this.dispose();
                }
            }));
            this.B((0, dom_1.$nO)(this.f, dom_1.$3O.MOUSE_OVER, () => {
                // Under some circumstances we have seen reports where the drop overlay is not being
                // cleaned up and as such the editor area remains under the overlay so that you cannot
                // type into the editor anymore. This seems related to using VMs and DND via host and
                // guest OS, though some users also saw it without VMs.
                // To protect against this issue we always destroy the overlay as soon as we detect a
                // mouse event over it. The delay is used to guarantee we are not interfering with the
                // actual DROP event that can also trigger a mouse over event.
                if (!this.r.isScheduled()) {
                    this.r.schedule();
                }
            }));
        }
        G(mousePosX, mousePosY) {
            const paneWidth = this.s.clientWidth;
            const paneHeight = this.s.clientHeight;
            const splitWidthThreshold = paneWidth / 2;
            const splitHeightThreshold = paneHeight / 2;
            let dropDirection;
            if (this.t === 0 /* Orientation.VERTICAL */) {
                if (mousePosY < splitHeightThreshold) {
                    dropDirection = 0 /* DropDirection.UP */;
                }
                else if (mousePosY >= splitHeightThreshold) {
                    dropDirection = 1 /* DropDirection.DOWN */;
                }
            }
            else if (this.t === 1 /* Orientation.HORIZONTAL */) {
                if (mousePosX < splitWidthThreshold) {
                    dropDirection = 2 /* DropDirection.LEFT */;
                }
                else if (mousePosX >= splitWidthThreshold) {
                    dropDirection = 3 /* DropDirection.RIGHT */;
                }
            }
            // Draw overlay based on split direction
            switch (dropDirection) {
                case 0 /* DropDirection.UP */:
                    this.I({ top: '0', left: '0', width: '100%', height: '50%' });
                    break;
                case 1 /* DropDirection.DOWN */:
                    this.I({ bottom: '0', left: '0', width: '100%', height: '50%' });
                    break;
                case 2 /* DropDirection.LEFT */:
                    this.I({ top: '0', left: '0', width: '50%', height: '100%' });
                    break;
                case 3 /* DropDirection.RIGHT */:
                    this.I({ top: '0', right: '0', width: '50%', height: '100%' });
                    break;
                default: {
                    // const top = this.bounds?.top || 0;
                    // const left = this.bounds?.bottom || 0;
                    let top = '0';
                    let left = '0';
                    let width = '100%';
                    let height = '100%';
                    if (this.u) {
                        const boundingRect = this.f.getBoundingClientRect();
                        top = `${this.u.top - boundingRect.top}px`;
                        left = `${this.u.left - boundingRect.left}px`;
                        height = `${this.u.bottom - this.u.top}px`;
                        width = `${this.u.right - this.u.left}px`;
                    }
                    this.I({ top, left, width, height });
                }
            }
            if ((this.t === 0 /* Orientation.VERTICAL */ && paneHeight <= 25) ||
                (this.t === 1 /* Orientation.HORIZONTAL */ && paneWidth <= 25)) {
                this.H(dropDirection);
            }
            else {
                this.H(undefined);
            }
            // Make sure the overlay is visible now
            this.g.style.opacity = '1';
            // Enable transition after a timeout to prevent initial animation
            setTimeout(() => this.g.classList.add('overlay-move-transition'), 0);
            // Remember as current split direction
            this.j = dropDirection;
        }
        H(direction) {
            this.g.style.borderTopWidth = direction === 0 /* DropDirection.UP */ ? '2px' : '0px';
            this.g.style.borderLeftWidth = direction === 2 /* DropDirection.LEFT */ ? '2px' : '0px';
            this.g.style.borderBottomWidth = direction === 1 /* DropDirection.DOWN */ ? '2px' : '0px';
            this.g.style.borderRightWidth = direction === 3 /* DropDirection.RIGHT */ ? '2px' : '0px';
        }
        I(options) {
            // Container
            this.f.style.height = '100%';
            // Overlay
            this.g.style.top = options.top || '';
            this.g.style.left = options.left || '';
            this.g.style.bottom = options.bottom || '';
            this.g.style.right = options.right || '';
            this.g.style.width = options.width;
            this.g.style.height = options.height;
        }
        contains(element) {
            return element === this.f || element === this.g;
        }
        dispose() {
            super.dispose();
            this.m = true;
        }
    }
    let ViewContainerMenuActions = class ViewContainerMenuActions extends actions_2.$qeb {
        constructor(element, viewContainer, viewDescriptorService, contextKeyService, menuService) {
            const scopedContextKeyService = contextKeyService.createScoped(element);
            scopedContextKeyService.createKey('viewContainer', viewContainer.id);
            const viewContainerLocationKey = scopedContextKeyService.createKey('viewContainerLocation', (0, views_1.$0E)(viewDescriptorService.getViewContainerLocation(viewContainer)));
            super(actions_1.$Ru.ViewContainerTitle, actions_1.$Ru.ViewContainerTitleContext, { shouldForwardArgs: true }, scopedContextKeyService, menuService);
            this.B(scopedContextKeyService);
            this.B(event_1.Event.filter(viewDescriptorService.onDidChangeContainerLocation, e => e.viewContainer === viewContainer)(() => viewContainerLocationKey.set((0, views_1.$0E)(viewDescriptorService.getViewContainerLocation(viewContainer)))));
        }
    };
    ViewContainerMenuActions = __decorate([
        __param(2, views_1.$_E),
        __param(3, contextkey_1.$3i),
        __param(4, actions_1.$Su)
    ], ViewContainerMenuActions);
    let $Seb = class $Seb extends component_1.$ZT {
        get onDidSashChange() {
            return (0, types_1.$uf)(this.j).onDidSashChange;
        }
        get panes() {
            return this.g.map(i => i.pane);
        }
        get views() {
            return this.panes;
        }
        get length() {
            return this.g.length;
        }
        get menuActions() {
            return this.X;
        }
        constructor(id, Y, Z, ab, bb, cb, db, eb, themeService, fb, gb, hb) {
            super(id, themeService, fb);
            this.Y = Y;
            this.Z = Z;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.g = [];
            this.m = false;
            this.s = false;
            this.u = false;
            this.N = [];
            this.O = this.B(new event_1.$fd());
            this.onTitleAreaUpdate = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onDidAddViews = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onDidRemoveViews = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onDidChangeViewVisibility = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onDidFocusView = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onDidBlurView = this.W.event;
            const container = this.hb.getViewContainerById(id);
            if (!container) {
                throw new Error('Could not find container');
            }
            this.viewContainer = container;
            this.L = `${id}.numberOfVisibleViews`;
            this.J = this.fb.getNumber(this.L, 1 /* StorageScope.WORKSPACE */, undefined);
            this.B((0, lifecycle_1.$ic)(() => this.N = (0, lifecycle_1.$fc)(this.N)));
            this.M = this.hb.getViewContainerModel(container);
        }
        create(parent) {
            const options = this.Y;
            options.orientation = this.jb;
            this.j = this.B(new paneview_1.$3R(parent, this.Y));
            if (this.I) {
                this.j.setBoundarySashes(this.I);
            }
            this.B(this.j.onDidDrop(({ from, to }) => this.movePane(from, to)));
            this.B(this.j.onDidScroll(_ => this.wb()));
            this.B(this.j.onDidSashReset((index) => this.xb(index)));
            this.B((0, dom_1.$nO)(parent, dom_1.$3O.CONTEXT_MENU, (e) => this.ib(new mouseEvent_1.$eO(e))));
            this.B(touch_1.$EP.addTarget(parent));
            this.B((0, dom_1.$nO)(parent, touch_1.EventType.Contextmenu, (e) => this.ib(new mouseEvent_1.$eO(e))));
            this.X = this.B(this.Z.createInstance(ViewContainerMenuActions, this.j.element, this.viewContainer));
            this.B(this.X.onDidChange(() => this.kb()));
            let overlay;
            const getOverlayBounds = () => {
                const fullSize = parent.getBoundingClientRect();
                const lastPane = this.panes[this.panes.length - 1].element.getBoundingClientRect();
                const top = this.jb === 0 /* Orientation.VERTICAL */ ? lastPane.bottom : fullSize.top;
                const left = this.jb === 1 /* Orientation.HORIZONTAL */ ? lastPane.right : fullSize.left;
                return {
                    top,
                    bottom: fullSize.bottom,
                    left,
                    right: fullSize.right,
                };
            };
            const inBounds = (bounds, pos) => {
                return pos.x >= bounds.left && pos.x <= bounds.right && pos.y >= bounds.top && pos.y <= bounds.bottom;
            };
            let bounds;
            this.B(dnd_1.$zeb.INSTANCE.registerTarget(parent, {
                onDragEnter: (e) => {
                    bounds = getOverlayBounds();
                    if (overlay && overlay.disposed) {
                        overlay = undefined;
                    }
                    if (!overlay && inBounds(bounds, e.eventData)) {
                        const dropData = e.dragAndDropData.getData();
                        if (dropData.type === 'view') {
                            const oldViewContainer = this.hb.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.hb.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && (!viewDescriptor || !viewDescriptor.canMoveView || this.viewContainer.rejectAddedViews)) {
                                return;
                            }
                            overlay = new ViewPaneDropOverlay(parent, undefined, bounds, this.hb.getViewContainerLocation(this.viewContainer), this.n);
                        }
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id) {
                            const container = this.hb.getViewContainerById(dropData.id);
                            const viewsToMove = this.hb.getViewContainerModel(container).allViewDescriptors;
                            if (!viewsToMove.some(v => !v.canMoveView) && viewsToMove.length > 0) {
                                overlay = new ViewPaneDropOverlay(parent, undefined, bounds, this.hb.getViewContainerLocation(this.viewContainer), this.n);
                            }
                        }
                    }
                },
                onDragOver: (e) => {
                    if (overlay && overlay.disposed) {
                        overlay = undefined;
                    }
                    if (overlay && !inBounds(bounds, e.eventData)) {
                        overlay.dispose();
                        overlay = undefined;
                    }
                    if (inBounds(bounds, e.eventData)) {
                        (0, dnd_1.$Aeb)(e.eventData.dataTransfer, 'move', overlay !== undefined);
                    }
                },
                onDragLeave: (e) => {
                    overlay?.dispose();
                    overlay = undefined;
                },
                onDrop: (e) => {
                    if (overlay) {
                        const dropData = e.dragAndDropData.getData();
                        const viewsToMove = [];
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id) {
                            const container = this.hb.getViewContainerById(dropData.id);
                            const allViews = this.hb.getViewContainerModel(container).allViewDescriptors;
                            if (!allViews.some(v => !v.canMoveView)) {
                                viewsToMove.push(...allViews);
                            }
                        }
                        else if (dropData.type === 'view') {
                            const oldViewContainer = this.hb.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.hb.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && viewDescriptor && viewDescriptor.canMoveView) {
                                this.hb.moveViewsToContainer([viewDescriptor], this.viewContainer);
                            }
                        }
                        const paneCount = this.panes.length;
                        if (viewsToMove.length > 0) {
                            this.hb.moveViewsToContainer(viewsToMove, this.viewContainer);
                        }
                        if (paneCount > 0) {
                            for (const view of viewsToMove) {
                                const paneToMove = this.panes.find(p => p.id === view.id);
                                if (paneToMove) {
                                    this.movePane(paneToMove, this.panes[this.panes.length - 1]);
                                }
                            }
                        }
                    }
                    overlay?.dispose();
                    overlay = undefined;
                }
            }));
            this.B(this.onDidSashChange(() => this.mb()));
            this.B(this.M.onDidAddVisibleViewDescriptors(added => this.rb(added)));
            this.B(this.M.onDidRemoveVisibleViewDescriptors(removed => this.sb(removed)));
            const addedViews = this.M.visibleViewDescriptors.map((viewDescriptor, index) => {
                const size = this.M.getSize(viewDescriptor.id);
                const collapsed = this.M.isCollapsed(viewDescriptor.id);
                return ({ viewDescriptor, index, size, collapsed });
            });
            if (addedViews.length) {
                this.rb(addedViews);
            }
            // Update headers after and title contributed views after available, since we read from cache in the beginning to know if the viewlet has single view or not. Ref #29609
            this.eb.whenInstalledExtensionsRegistered().then(() => {
                this.s = true;
                if (this.panes.length) {
                    this.kb();
                    this.vb();
                }
            });
            this.B(this.M.onDidChangeActiveViewDescriptors(() => this.O.fire()));
        }
        getTitle() {
            const containerTitle = this.M.title;
            if (this.isViewMergedWithContainer()) {
                const paneItemTitle = this.g[0].pane.title;
                if (containerTitle === paneItemTitle) {
                    return this.g[0].pane.title;
                }
                return paneItemTitle ? `${containerTitle}: ${paneItemTitle}` : containerTitle;
            }
            return containerTitle;
        }
        ib(event) {
            for (const paneItem of this.g) {
                // Do not show context menu if target is coming from inside pane views
                if ((0, dom_1.$NO)(event.target, paneItem.pane.element)) {
                    return;
                }
            }
            event.stopPropagation();
            event.preventDefault();
            this.cb.showContextMenu({
                getAnchor: () => event,
                getActions: () => this.menuActions?.getContextMenuActions() ?? []
            });
        }
        getActionsContext() {
            return undefined;
        }
        getActionViewItem(action) {
            if (this.isViewMergedWithContainer()) {
                return this.g[0].pane.getActionViewItem(action);
            }
            return (0, menuEntryActionViewItem_1.$F3)(this.Z, action);
        }
        focus() {
            if (this.c) {
                this.c.focus();
            }
            else if (this.g.length > 0) {
                for (const { pane: pane } of this.g) {
                    if (pane.isExpanded()) {
                        pane.focus();
                        return;
                    }
                }
            }
        }
        get jb() {
            switch (this.hb.getViewContainerLocation(this.viewContainer)) {
                case 0 /* ViewContainerLocation.Sidebar */:
                case 2 /* ViewContainerLocation.AuxiliaryBar */:
                    return 0 /* Orientation.VERTICAL */;
                case 1 /* ViewContainerLocation.Panel */:
                    return this.bb.getPanelPosition() === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            }
            return 0 /* Orientation.VERTICAL */;
        }
        layout(dimension) {
            if (this.j) {
                if (this.j.orientation !== this.jb) {
                    this.j.flipOrientation(dimension.height, dimension.width);
                }
                this.j.layout(dimension.height, dimension.width);
            }
            this.H = dimension;
            if (this.u) {
                this.mb();
            }
            else {
                this.u = true;
                this.nb();
            }
        }
        setBoundarySashes(sashes) {
            this.I = sashes;
            this.j?.setBoundarySashes(sashes);
        }
        getOptimalWidth() {
            const additionalMargin = 16;
            const optimalWidth = Math.max(...this.panes.map(view => view.getOptimalWidth() || 0));
            return optimalWidth + additionalMargin;
        }
        addPanes(panes) {
            const wasMerged = this.isViewMergedWithContainer();
            for (const { pane: pane, size, index } of panes) {
                this.tb(pane, size, index);
            }
            this.vb();
            if (this.isViewMergedWithContainer() !== wasMerged) {
                this.kb();
            }
            this.Q.fire(panes.map(({ pane }) => pane));
        }
        setVisible(visible) {
            if (this.m !== !!visible) {
                this.m = visible;
                this.P.fire(visible);
            }
            this.panes.filter(view => view.isVisible() !== visible)
                .map((view) => view.setVisible(visible));
        }
        isVisible() {
            return this.m;
        }
        kb() {
            this.O.fire();
        }
        lb(viewDescriptor, options) {
            return this.Z.createInstance(viewDescriptor.ctorDescriptor.ctor, ...(viewDescriptor.ctorDescriptor.staticArguments || []), options);
        }
        getView(id) {
            return this.panes.filter(view => view.id === id)[0];
        }
        mb() {
            // Save size only when the layout has happened
            if (this.u) {
                this.M.setSizes(this.panes.map(view => ({ id: view.id, size: this.getPaneSize(view) })));
            }
        }
        nb() {
            // Restore sizes only when the layout has happened
            if (this.u) {
                let initialSizes;
                for (let i = 0; i < this.M.visibleViewDescriptors.length; i++) {
                    const pane = this.panes[i];
                    const viewDescriptor = this.M.visibleViewDescriptors[i];
                    const size = this.M.getSize(viewDescriptor.id);
                    if (typeof size === 'number') {
                        this.resizePane(pane, size);
                    }
                    else {
                        initialSizes = initialSizes ? initialSizes : this.ob();
                        this.resizePane(pane, initialSizes.get(pane.id) || 200);
                    }
                }
            }
        }
        ob() {
            const sizes = new Map();
            if (this.H) {
                const totalWeight = this.M.visibleViewDescriptors.reduce((totalWeight, { weight }) => totalWeight + (weight || 20), 0);
                for (const viewDescriptor of this.M.visibleViewDescriptors) {
                    if (this.jb === 0 /* Orientation.VERTICAL */) {
                        sizes.set(viewDescriptor.id, this.H.height * (viewDescriptor.weight || 20) / totalWeight);
                    }
                    else {
                        sizes.set(viewDescriptor.id, this.H.width * (viewDescriptor.weight || 20) / totalWeight);
                    }
                }
            }
            return sizes;
        }
        G() {
            this.panes.forEach((view) => view.saveState());
            this.fb.store(this.L, this.length, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        qb(event, viewPane) {
            event.stopPropagation();
            event.preventDefault();
            const actions = viewPane.menuActions.getContextMenuActions();
            this.cb.showContextMenu({
                getAnchor: () => event,
                getActions: () => actions
            });
        }
        openView(id, focus) {
            let view = this.getView(id);
            if (!view) {
                this.toggleViewVisibility(id);
            }
            view = this.getView(id);
            if (view) {
                view.setExpanded(true);
                if (focus) {
                    view.focus();
                }
            }
            return view;
        }
        rb(added) {
            const panesToAdd = [];
            for (const { viewDescriptor, collapsed, index, size } of added) {
                const pane = this.lb(viewDescriptor, {
                    id: viewDescriptor.id,
                    title: viewDescriptor.name,
                    fromExtensionId: viewDescriptor.extensionId,
                    expanded: !collapsed
                });
                pane.render();
                const contextMenuDisposable = (0, dom_1.$nO)(pane.draggableElement, 'contextmenu', e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.qb(new mouseEvent_1.$eO(e), pane);
                });
                const collapseDisposable = event_1.Event.latch(event_1.Event.map(pane.onDidChange, () => !pane.isExpanded()))(collapsed => {
                    this.M.setCollapsed(viewDescriptor.id, collapsed);
                });
                this.N.splice(index, 0, (0, lifecycle_1.$hc)(contextMenuDisposable, collapseDisposable));
                panesToAdd.push({ pane, size: size || pane.minimumSize, index });
            }
            this.addPanes(panesToAdd);
            this.nb();
            const panes = [];
            for (const { pane } of panesToAdd) {
                pane.setVisible(this.isVisible());
                panes.push(pane);
            }
            return panes;
        }
        sb(removed) {
            removed = removed.sort((a, b) => b.index - a.index);
            const panesToRemove = [];
            for (const { index } of removed) {
                const [disposable] = this.N.splice(index, 1);
                disposable.dispose();
                panesToRemove.push(this.panes[index]);
            }
            this.removePanes(panesToRemove);
            for (const pane of panesToRemove) {
                pane.setVisible(false);
            }
        }
        toggleViewVisibility(viewId) {
            // Check if view is active
            if (this.M.activeViewDescriptors.some(viewDescriptor => viewDescriptor.id === viewId)) {
                const visible = !this.M.isVisible(viewId);
                this.M.setVisible(viewId, visible);
            }
        }
        tb(pane, size, index = this.g.length - 1) {
            const onDidFocus = pane.onDidFocus(() => {
                this.U.fire(pane);
                this.c = pane;
            });
            const onDidBlur = pane.onDidBlur(() => this.W.fire(pane));
            const onDidChangeTitleArea = pane.onDidChangeTitleArea(() => {
                if (this.isViewMergedWithContainer()) {
                    this.kb();
                }
            });
            const onDidChangeVisibility = pane.onDidChangeBodyVisibility(() => this.S.fire(pane));
            const onDidChange = pane.onDidChange(() => {
                if (pane === this.c && !pane.isExpanded()) {
                    this.c = undefined;
                }
            });
            const isPanel = this.hb.getViewContainerLocation(this.viewContainer) === 1 /* ViewContainerLocation.Panel */;
            pane.style({
                headerForeground: (0, colorRegistry_1.$pv)(isPanel ? theme_1.$U_ : theme_1.$Oab),
                headerBackground: (0, colorRegistry_1.$pv)(isPanel ? theme_1.$T_ : theme_1.$Nab),
                headerBorder: (0, colorRegistry_1.$pv)(isPanel ? theme_1.$V_ : theme_1.$Pab),
                dropBackground: (0, colorRegistry_1.$pv)(isPanel ? theme_1.$S_ : theme_1.$Mab),
                leftBorder: isPanel ? (0, colorRegistry_1.$pv)(theme_1.$W_) : undefined
            });
            const store = new lifecycle_1.$jc();
            store.add((0, lifecycle_1.$hc)(pane, onDidFocus, onDidBlur, onDidChangeTitleArea, onDidChange, onDidChangeVisibility));
            const paneItem = { pane, disposable: store };
            this.g.splice(index, 0, paneItem);
            (0, types_1.$uf)(this.j).addPane(pane, size, index);
            let overlay;
            store.add(dnd_1.$zeb.INSTANCE.registerDraggable(pane.draggableElement, () => { return { type: 'view', id: pane.id }; }, {}));
            store.add(dnd_1.$zeb.INSTANCE.registerTarget(pane.dropTargetElement, {
                onDragEnter: (e) => {
                    if (!overlay) {
                        const dropData = e.dragAndDropData.getData();
                        if (dropData.type === 'view' && dropData.id !== pane.id) {
                            const oldViewContainer = this.hb.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.hb.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && (!viewDescriptor || !viewDescriptor.canMoveView || this.viewContainer.rejectAddedViews)) {
                                return;
                            }
                            overlay = new ViewPaneDropOverlay(pane.dropTargetElement, this.jb ?? 0 /* Orientation.VERTICAL */, undefined, this.hb.getViewContainerLocation(this.viewContainer), this.n);
                        }
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
                            const container = this.hb.getViewContainerById(dropData.id);
                            const viewsToMove = this.hb.getViewContainerModel(container).allViewDescriptors;
                            if (!viewsToMove.some(v => !v.canMoveView) && viewsToMove.length > 0) {
                                overlay = new ViewPaneDropOverlay(pane.dropTargetElement, this.jb ?? 0 /* Orientation.VERTICAL */, undefined, this.hb.getViewContainerLocation(this.viewContainer), this.n);
                            }
                        }
                    }
                },
                onDragOver: (e) => {
                    (0, dnd_1.$Aeb)(e.eventData.dataTransfer, 'move', overlay !== undefined);
                },
                onDragLeave: (e) => {
                    overlay?.dispose();
                    overlay = undefined;
                },
                onDrop: (e) => {
                    if (overlay) {
                        const dropData = e.dragAndDropData.getData();
                        const viewsToMove = [];
                        let anchorView;
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
                            const container = this.hb.getViewContainerById(dropData.id);
                            const allViews = this.hb.getViewContainerModel(container).allViewDescriptors;
                            if (allViews.length > 0 && !allViews.some(v => !v.canMoveView)) {
                                viewsToMove.push(...allViews);
                                anchorView = allViews[0];
                            }
                        }
                        else if (dropData.type === 'view') {
                            const oldViewContainer = this.hb.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.hb.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && viewDescriptor && viewDescriptor.canMoveView && !this.viewContainer.rejectAddedViews) {
                                viewsToMove.push(viewDescriptor);
                            }
                            if (viewDescriptor) {
                                anchorView = viewDescriptor;
                            }
                        }
                        if (viewsToMove) {
                            this.hb.moveViewsToContainer(viewsToMove, this.viewContainer);
                        }
                        if (anchorView) {
                            if (overlay.currentDropOperation === 1 /* DropDirection.DOWN */ ||
                                overlay.currentDropOperation === 3 /* DropDirection.RIGHT */) {
                                const fromIndex = this.panes.findIndex(p => p.id === anchorView.id);
                                let toIndex = this.panes.findIndex(p => p.id === pane.id);
                                if (fromIndex >= 0 && toIndex >= 0) {
                                    if (fromIndex > toIndex) {
                                        toIndex++;
                                    }
                                    if (toIndex < this.panes.length && toIndex !== fromIndex) {
                                        this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                                    }
                                }
                            }
                            if (overlay.currentDropOperation === 0 /* DropDirection.UP */ ||
                                overlay.currentDropOperation === 2 /* DropDirection.LEFT */) {
                                const fromIndex = this.panes.findIndex(p => p.id === anchorView.id);
                                let toIndex = this.panes.findIndex(p => p.id === pane.id);
                                if (fromIndex >= 0 && toIndex >= 0) {
                                    if (fromIndex < toIndex) {
                                        toIndex--;
                                    }
                                    if (toIndex >= 0 && toIndex !== fromIndex) {
                                        this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                                    }
                                }
                            }
                            if (viewsToMove.length > 1) {
                                viewsToMove.slice(1).forEach(view => {
                                    let toIndex = this.panes.findIndex(p => p.id === anchorView.id);
                                    const fromIndex = this.panes.findIndex(p => p.id === view.id);
                                    if (fromIndex >= 0 && toIndex >= 0) {
                                        if (fromIndex > toIndex) {
                                            toIndex++;
                                        }
                                        if (toIndex < this.panes.length && toIndex !== fromIndex) {
                                            this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                                            anchorView = view;
                                        }
                                    }
                                });
                            }
                        }
                    }
                    overlay?.dispose();
                    overlay = undefined;
                }
            }));
        }
        removePanes(panes) {
            const wasMerged = this.isViewMergedWithContainer();
            panes.forEach(pane => this.ub(pane));
            this.vb();
            if (wasMerged !== this.isViewMergedWithContainer()) {
                this.kb();
            }
            this.R.fire(panes);
        }
        ub(pane) {
            const index = this.g.findIndex(i => i.pane === pane);
            if (index === -1) {
                return;
            }
            if (this.c === pane) {
                this.c = undefined;
            }
            (0, types_1.$uf)(this.j).removePane(pane);
            const [paneItem] = this.g.splice(index, 1);
            paneItem.disposable.dispose();
        }
        movePane(from, to) {
            const fromIndex = this.g.findIndex(item => item.pane === from);
            const toIndex = this.g.findIndex(item => item.pane === to);
            const fromViewDescriptor = this.M.visibleViewDescriptors[fromIndex];
            const toViewDescriptor = this.M.visibleViewDescriptors[toIndex];
            if (fromIndex < 0 || fromIndex >= this.g.length) {
                return;
            }
            if (toIndex < 0 || toIndex >= this.g.length) {
                return;
            }
            const [paneItem] = this.g.splice(fromIndex, 1);
            this.g.splice(toIndex, 0, paneItem);
            (0, types_1.$uf)(this.j).movePane(from, to);
            this.M.move(fromViewDescriptor.id, toViewDescriptor.id);
            this.kb();
        }
        resizePane(pane, size) {
            (0, types_1.$uf)(this.j).resizePane(pane, size);
        }
        getPaneSize(pane) {
            return (0, types_1.$uf)(this.j).getPaneSize(pane);
        }
        vb() {
            if (this.isViewMergedWithContainer()) {
                if (this.g[0].pane.isExpanded()) {
                    this.f = undefined;
                }
                else {
                    this.f = this.g[0].pane;
                    this.g[0].pane.setExpanded(true);
                }
                this.g[0].pane.headerVisible = false;
            }
            else {
                this.g.forEach(i => {
                    i.pane.headerVisible = true;
                    if (i.pane === this.f) {
                        i.pane.setExpanded(false);
                    }
                });
                this.f = undefined;
            }
        }
        isViewMergedWithContainer() {
            if (!(this.Y.mergeViewWithContainerWhenSingleView && this.g.length === 1)) {
                return false;
            }
            if (!this.s) {
                if (this.J === undefined) {
                    return this.g[0].pane.isExpanded();
                }
                // Check in cache so that view do not jump. See #29609
                return this.J === 1;
            }
            return true;
        }
        wb() {
            for (const pane of this.panes) {
                pane.onDidScrollRoot();
            }
        }
        xb(index) {
            let firstPane = undefined;
            let secondPane = undefined;
            // Deal with collapsed views: to be clever, we split the space taken by the nearest uncollapsed views
            for (let i = index; i >= 0; i--) {
                if (this.g[i].pane?.isVisible() && this.g[i]?.pane.isExpanded()) {
                    firstPane = this.g[i].pane;
                    break;
                }
            }
            for (let i = index + 1; i < this.g.length; i++) {
                if (this.g[i].pane?.isVisible() && this.g[i]?.pane.isExpanded()) {
                    secondPane = this.g[i].pane;
                    break;
                }
            }
            if (firstPane && secondPane) {
                const firstPaneSize = this.getPaneSize(firstPane);
                const secondPaneSize = this.getPaneSize(secondPane);
                // Avoid rounding errors and be consistent when resizing
                // The first pane always get half rounded up and the second is half rounded down
                const newFirstPaneSize = Math.ceil((firstPaneSize + secondPaneSize) / 2);
                const newSecondPaneSize = Math.floor((firstPaneSize + secondPaneSize) / 2);
                // Shrink the larger pane first, then grow the smaller pane
                // This prevents interfering with other view sizes
                if (firstPaneSize > secondPaneSize) {
                    this.resizePane(firstPane, newFirstPaneSize);
                    this.resizePane(secondPane, newSecondPaneSize);
                }
                else {
                    this.resizePane(secondPane, newSecondPaneSize);
                    this.resizePane(firstPane, newFirstPaneSize);
                }
            }
        }
        dispose() {
            super.dispose();
            this.g.forEach(i => i.disposable.dispose());
            if (this.j) {
                this.j.dispose();
            }
        }
    };
    exports.$Seb = $Seb;
    exports.$Seb = $Seb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, configuration_1.$8h),
        __param(4, layoutService_1.$Meb),
        __param(5, contextView_1.$WZ),
        __param(6, telemetry_1.$9k),
        __param(7, extensions_1.$MF),
        __param(8, themeService_1.$gv),
        __param(9, storage_1.$Vo),
        __param(10, workspace_1.$Kh),
        __param(11, views_1.$_E)
    ], $Seb);
    class $Teb extends actions_1.$Wu {
        constructor(desc) {
            super(desc);
            this.desc = desc;
        }
        run(accessor, ...args) {
            const viewPaneContainer = accessor.get(views_1.$$E).getActiveViewPaneContainerWithId(this.desc.viewPaneContainerId);
            if (viewPaneContainer) {
                return this.runInViewPaneContainer(accessor, viewPaneContainer, ...args);
            }
        }
    }
    exports.$Teb = $Teb;
    class MoveViewPosition extends actions_1.$Wu {
        constructor(desc, c) {
            super(desc);
            this.c = c;
        }
        async run(accessor) {
            const viewDescriptorService = accessor.get(views_1.$_E);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const viewId = contextkeys_1.$Hdb.getValue(contextKeyService);
            if (viewId === undefined) {
                return;
            }
            const viewContainer = viewDescriptorService.getViewContainerByViewId(viewId);
            const model = viewDescriptorService.getViewContainerModel(viewContainer);
            const viewDescriptor = model.visibleViewDescriptors.find(vd => vd.id === viewId);
            const currentIndex = model.visibleViewDescriptors.indexOf(viewDescriptor);
            if (currentIndex + this.c < 0 || currentIndex + this.c >= model.visibleViewDescriptors.length) {
                return;
            }
            const newPosition = model.visibleViewDescriptors[currentIndex + this.c];
            model.move(viewDescriptor.id, newPosition.id);
        }
    }
    (0, actions_1.$Xu)(class MoveViewUp extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewUp',
                title: nls.localize(1, null),
                keybinding: {
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 16 /* KeyCode.UpArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.$Hdb.notEqualsTo('')
                }
            }, -1);
        }
    });
    (0, actions_1.$Xu)(class MoveViewLeft extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewLeft',
                title: nls.localize(2, null),
                keybinding: {
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 15 /* KeyCode.LeftArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.$Hdb.notEqualsTo('')
                }
            }, -1);
        }
    });
    (0, actions_1.$Xu)(class MoveViewDown extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewDown',
                title: nls.localize(3, null),
                keybinding: {
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 18 /* KeyCode.DownArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.$Hdb.notEqualsTo('')
                }
            }, 1);
        }
    });
    (0, actions_1.$Xu)(class MoveViewRight extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewRight',
                title: nls.localize(4, null),
                keybinding: {
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 17 /* KeyCode.RightArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.$Hdb.notEqualsTo('')
                }
            }, 1);
        }
    });
    (0, actions_1.$Xu)(class MoveViews extends actions_1.$Wu {
        constructor() {
            super({
                id: 'vscode.moveViews',
                title: nls.localize(5, null),
            });
        }
        async run(accessor, options) {
            if (!Array.isArray(options?.viewIds) || typeof options?.destinationId !== 'string') {
                return Promise.reject('Invalid arguments');
            }
            const viewDescriptorService = accessor.get(views_1.$_E);
            const destination = viewDescriptorService.getViewContainerById(options.destinationId);
            if (!destination) {
                return;
            }
            // FYI, don't use `moveViewsToContainer` in 1 shot, because it expects all views to have the same current location
            for (const viewId of options.viewIds) {
                const viewDescriptor = viewDescriptorService.getViewDescriptorById(viewId);
                if (viewDescriptor?.canMoveView) {
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], destination, views_1.ViewVisibilityState.Default);
                }
            }
            await accessor.get(views_1.$$E).openViewContainer(destination.id, true);
        }
    });
});
//# sourceMappingURL=viewPaneContainer.js.map