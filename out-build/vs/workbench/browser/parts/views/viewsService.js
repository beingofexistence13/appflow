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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/contextkey/common/contextkey", "vs/base/common/event", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/browser/parts/views/viewsService", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/contextview/browser/contextView", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/workbench/browser/panecomposite", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/uri", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, lifecycle_1, views_1, contextkeys_1, platform_1, storage_1, contextkey_1, event_1, types_1, actions_1, nls_1, extensions_1, instantiation_1, telemetry_1, themeService_1, contextView_1, extensions_2, workspace_1, panecomposite_1, layoutService_1, uri_1, actionCommonCategories_1, editorGroupsService_1, viewsViewlet_1, panecomposite_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hyb = exports.$gyb = void 0;
    let $gyb = class $gyb extends lifecycle_1.$kc {
        constructor(m, n, r, s) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeViewVisibility = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeViewContainerVisibility = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeFocusedView = this.g.event;
            this.a = new Map();
            this.h = new Map();
            this.b = new Map();
            this.B((0, lifecycle_1.$ic)(() => {
                this.a.forEach(disposable => disposable.dispose());
                this.a.clear();
            }));
            this.m.viewContainers.forEach(viewContainer => this.C(viewContainer, this.m.getViewContainerLocation(viewContainer)));
            this.B(this.m.onDidChangeViewContainers(({ added, removed }) => this.z(added, removed)));
            this.B(this.m.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.D(viewContainer, from, to)));
            // View Container Visibility
            this.B(this.n.onDidPaneCompositeOpen(e => this.f.fire({ id: e.composite.getId(), visible: true, location: e.viewContainerLocation })));
            this.B(this.n.onDidPaneCompositeClose(e => this.f.fire({ id: e.composite.getId(), visible: false, location: e.viewContainerLocation })));
            this.j = contextkeys_1.$Hdb.bindTo(r);
        }
        t(added) {
            for (const view of added) {
                this.u(view, view.isBodyVisible());
            }
        }
        u(view, visible) {
            this.y(view).set(visible);
            this.c.fire({ id: view.id, visible: visible });
        }
        w(removed) {
            for (const view of removed) {
                this.u(view, false);
            }
        }
        y(view) {
            const visibleContextKeyId = (0, contextkeys_1.$Idb)(view.id);
            let contextKey = this.h.get(visibleContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.$2i(visibleContextKeyId, false).bindTo(this.r);
                this.h.set(visibleContextKeyId, contextKey);
            }
            return contextKey;
        }
        z(added, removed) {
            for (const { container, location } of removed) {
                this.R(container, location);
            }
            for (const { container, location } of added) {
                this.C(container, location);
            }
        }
        C(viewContainer, viewContainerLocation) {
            this.Q(viewContainer, viewContainerLocation);
            const viewContainerModel = this.m.getViewContainerModel(viewContainer);
            this.F(viewContainerModel.allViewDescriptors, viewContainer);
            this.B(viewContainerModel.onDidChangeAllViewDescriptors(({ added, removed }) => {
                this.F(added, viewContainer);
                this.G(removed);
            }));
            this.B(this.M(viewContainer));
        }
        D(viewContainer, from, to) {
            this.R(viewContainer, from);
            this.Q(viewContainer, to);
        }
        F(views, container) {
            const location = this.m.getViewContainerLocation(container);
            if (location === null) {
                return;
            }
            const composite = this.I(container.id, location);
            for (const viewDescriptor of views) {
                const disposables = new lifecycle_1.$jc();
                disposables.add(this.N(viewDescriptor));
                disposables.add(this.O(viewDescriptor, composite?.name && composite.name !== composite.id ? composite.name : actionCommonCategories_1.$Nl.View));
                disposables.add(this.P(viewDescriptor));
                this.a.set(viewDescriptor, disposables);
            }
        }
        G(views) {
            for (const view of views) {
                const disposable = this.a.get(view);
                if (disposable) {
                    disposable.dispose();
                    this.a.delete(view);
                }
            }
        }
        async H(compositeId, location, focus) {
            return this.n.openPaneComposite(compositeId, location, focus);
        }
        I(compositeId, location) {
            return this.n.getPaneComposite(compositeId, location);
        }
        isViewContainerVisible(id) {
            const viewContainer = this.m.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.m.getViewContainerLocation(viewContainer);
                if (viewContainerLocation !== null) {
                    return this.n.getActivePaneComposite(viewContainerLocation)?.getId() === id;
                }
            }
            return false;
        }
        getVisibleViewContainer(location) {
            const viewContainerId = this.n.getActivePaneComposite(location)?.getId();
            return viewContainerId ? this.m.getViewContainerById(viewContainerId) : null;
        }
        getActiveViewPaneContainerWithId(viewContainerId) {
            const viewContainer = this.m.getViewContainerById(viewContainerId);
            return viewContainer ? this.J(viewContainer) : null;
        }
        async openViewContainer(id, focus) {
            const viewContainer = this.m.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.m.getViewContainerLocation(viewContainer);
                if (viewContainerLocation !== null) {
                    const paneComposite = await this.n.openPaneComposite(id, viewContainerLocation, focus);
                    return paneComposite || null;
                }
            }
            return null;
        }
        async closeViewContainer(id) {
            const viewContainer = this.m.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.m.getViewContainerLocation(viewContainer);
                const isActive = viewContainerLocation !== null && this.n.getActivePaneComposite(viewContainerLocation);
                if (viewContainerLocation !== null) {
                    return isActive ? this.s.setPartHidden(true, $hyb(viewContainerLocation)) : undefined;
                }
            }
        }
        isViewVisible(id) {
            const activeView = this.getActiveViewWithId(id);
            return activeView?.isBodyVisible() || false;
        }
        getActiveViewWithId(id) {
            const viewContainer = this.m.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.J(viewContainer);
                if (activeViewPaneContainer) {
                    return activeViewPaneContainer.getView(id);
                }
            }
            return null;
        }
        getViewWithId(id) {
            const viewContainer = this.m.getViewContainerByViewId(id);
            if (viewContainer) {
                const viewPaneContainer = this.b.get(viewContainer.id);
                if (viewPaneContainer) {
                    return viewPaneContainer.getView(id);
                }
            }
            return null;
        }
        getFocusedViewName() {
            const viewId = this.r.getContextKeyValue(contextkeys_1.$Hdb.key) ?? '';
            return this.m.getViewDescriptorById(viewId.toString())?.name ?? '';
        }
        async openView(id, focus) {
            const viewContainer = this.m.getViewContainerByViewId(id);
            if (!viewContainer) {
                return null;
            }
            if (!this.m.getViewContainerModel(viewContainer).activeViewDescriptors.some(viewDescriptor => viewDescriptor.id === id)) {
                return null;
            }
            const location = this.m.getViewContainerLocation(viewContainer);
            const compositeDescriptor = this.I(viewContainer.id, location);
            if (compositeDescriptor) {
                const paneComposite = await this.H(compositeDescriptor.id, location);
                if (paneComposite && paneComposite.openView) {
                    return paneComposite.openView(id, focus) || null;
                }
                else if (focus) {
                    paneComposite?.focus();
                }
            }
            return null;
        }
        closeView(id) {
            const viewContainer = this.m.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.J(viewContainer);
                if (activeViewPaneContainer) {
                    const view = activeViewPaneContainer.getView(id);
                    if (view) {
                        if (activeViewPaneContainer.views.length === 1) {
                            const location = this.m.getViewContainerLocation(viewContainer);
                            if (location === 0 /* ViewContainerLocation.Sidebar */) {
                                this.s.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                            }
                            else if (location === 1 /* ViewContainerLocation.Panel */ || location === 2 /* ViewContainerLocation.AuxiliaryBar */) {
                                this.n.hideActivePaneComposite(location);
                            }
                            // The blur event doesn't fire on WebKit when the focused element is hidden,
                            // so the context key needs to be forced here too otherwise a view may still
                            // think it's showing, breaking toggle commands.
                            if (this.j.get() === id) {
                                this.j.reset();
                            }
                        }
                        else {
                            view.setExpanded(false);
                        }
                    }
                }
            }
        }
        J(viewContainer) {
            const location = this.m.getViewContainerLocation(viewContainer);
            if (location === null) {
                return null;
            }
            const activePaneComposite = this.n.getActivePaneComposite(location);
            if (activePaneComposite?.getId() === viewContainer.id) {
                return activePaneComposite.getViewPaneContainer() || null;
            }
            return null;
        }
        getViewProgressIndicator(viewId) {
            const viewContainer = this.m.getViewContainerByViewId(viewId);
            if (!viewContainer) {
                return undefined;
            }
            const viewPaneContainer = this.b.get(viewContainer.id);
            if (!viewPaneContainer) {
                return undefined;
            }
            const view = viewPaneContainer.getView(viewId);
            if (!view) {
                return undefined;
            }
            if (viewPaneContainer.isViewMergedWithContainer()) {
                return this.L(viewContainer);
            }
            return view.getProgressIndicator();
        }
        L(viewContainer) {
            const viewContainerLocation = this.m.getViewContainerLocation(viewContainer);
            if (viewContainerLocation === null) {
                return undefined;
            }
            return this.n.getProgressIndicator(viewContainer.id, viewContainerLocation);
        }
        M(viewContainer) {
            const disposables = new lifecycle_1.$jc();
            if (viewContainer.openCommandActionDescriptor) {
                const { id, mnemonicTitle, keybindings, order } = viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id };
                const title = viewContainer.openCommandActionDescriptor.title ?? viewContainer.title;
                const that = this;
                disposables.add((0, actions_1.$Xu)(class OpenViewContainerAction extends actions_1.$Wu {
                    constructor() {
                        super({
                            id,
                            get title() {
                                const viewContainerLocation = that.m.getViewContainerLocation(viewContainer);
                                const localizedTitle = typeof title === 'string' ? title : title.value;
                                const originalTitle = typeof title === 'string' ? title : title.original;
                                if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                                    return { value: (0, nls_1.localize)(0, null, localizedTitle), original: `Show ${originalTitle}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)(1, null, localizedTitle), original: `Toggle ${originalTitle}` };
                                }
                            },
                            category: actionCommonCategories_1.$Nl.View,
                            precondition: contextkey_1.$Ii.has((0, contextkeys_1.$Jdb)(viewContainer.id)),
                            keybinding: keybindings ? { ...keybindings, weight: 200 /* KeybindingWeight.WorkbenchContrib */ } : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.$5C);
                        const viewDescriptorService = serviceAccessor.get(views_1.$_E);
                        const layoutService = serviceAccessor.get(layoutService_1.$Meb);
                        const viewsService = serviceAccessor.get(views_1.$$E);
                        const viewContainerLocation = viewDescriptorService.getViewContainerLocation(viewContainer);
                        switch (viewContainerLocation) {
                            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                            case 0 /* ViewContainerLocation.Sidebar */: {
                                const part = viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */ ? "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ : "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
                                if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus(part)) {
                                    await viewsService.openViewContainer(viewContainer.id, true);
                                }
                                else {
                                    editorGroupService.activeGroup.focus();
                                }
                                break;
                            }
                            case 1 /* ViewContainerLocation.Panel */:
                                if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                                    await viewsService.openViewContainer(viewContainer.id, true);
                                }
                                else {
                                    viewsService.closeViewContainer(viewContainer.id);
                                }
                                break;
                        }
                    }
                }));
                if (mnemonicTitle) {
                    const defaultLocation = this.m.getDefaultViewContainerLocation(viewContainer);
                    disposables.add(actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarViewMenu, {
                        command: {
                            id,
                            title: mnemonicTitle,
                        },
                        group: defaultLocation === 0 /* ViewContainerLocation.Sidebar */ ? '3_views' : '4_panels',
                        when: contextkey_1.$Ii.has((0, contextkeys_1.$Jdb)(viewContainer.id)),
                        order: order ?? Number.MAX_VALUE
                    }));
                }
            }
            return disposables;
        }
        N(viewDescriptor) {
            const disposables = new lifecycle_1.$jc();
            if (viewDescriptor.openCommandActionDescriptor) {
                const title = viewDescriptor.openCommandActionDescriptor.title ?? viewDescriptor.name;
                const commandId = viewDescriptor.openCommandActionDescriptor.id;
                const that = this;
                disposables.add((0, actions_1.$Xu)(class OpenViewAction extends actions_1.$Wu {
                    constructor() {
                        super({
                            id: commandId,
                            get title() {
                                const viewContainerLocation = that.m.getViewLocationById(viewDescriptor.id);
                                const localizedTitle = typeof title === 'string' ? title : title.value;
                                const originalTitle = typeof title === 'string' ? title : title.original;
                                if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                                    return { value: (0, nls_1.localize)(2, null, localizedTitle), original: `Show ${originalTitle}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)(3, null, localizedTitle), original: `Toggle ${originalTitle}` };
                                }
                            },
                            category: actionCommonCategories_1.$Nl.View,
                            precondition: contextkey_1.$Ii.has(`${viewDescriptor.id}.active`),
                            keybinding: viewDescriptor.openCommandActionDescriptor.keybindings ? { ...viewDescriptor.openCommandActionDescriptor.keybindings, weight: 200 /* KeybindingWeight.WorkbenchContrib */ } : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.$5C);
                        const viewDescriptorService = serviceAccessor.get(views_1.$_E);
                        const layoutService = serviceAccessor.get(layoutService_1.$Meb);
                        const viewsService = serviceAccessor.get(views_1.$$E);
                        const contextKeyService = serviceAccessor.get(contextkey_1.$3i);
                        const focusedViewId = contextkeys_1.$Hdb.getValue(contextKeyService);
                        if (focusedViewId === viewDescriptor.id) {
                            const viewLocation = viewDescriptorService.getViewLocationById(viewDescriptor.id);
                            if (viewDescriptorService.getViewLocationById(viewDescriptor.id) === 0 /* ViewContainerLocation.Sidebar */) {
                                // focus the editor if the view is focused and in the side bar
                                editorGroupService.activeGroup.focus();
                            }
                            else if (viewLocation !== null) {
                                // otherwise hide the part where the view lives if focused
                                layoutService.setPartHidden(true, $hyb(viewLocation));
                            }
                        }
                        else {
                            viewsService.openView(viewDescriptor.id, true);
                        }
                    }
                }));
                if (viewDescriptor.openCommandActionDescriptor.mnemonicTitle) {
                    const defaultViewContainer = this.m.getDefaultContainerById(viewDescriptor.id);
                    if (defaultViewContainer) {
                        const defaultLocation = this.m.getDefaultViewContainerLocation(defaultViewContainer);
                        disposables.add(actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarViewMenu, {
                            command: {
                                id: commandId,
                                title: viewDescriptor.openCommandActionDescriptor.mnemonicTitle,
                            },
                            group: defaultLocation === 0 /* ViewContainerLocation.Sidebar */ ? '3_views' : '4_panels',
                            when: contextkey_1.$Ii.has(`${viewDescriptor.id}.active`),
                            order: viewDescriptor.openCommandActionDescriptor.order ?? Number.MAX_VALUE
                        }));
                    }
                }
            }
            return disposables;
        }
        O(viewDescriptor, category) {
            return (0, actions_1.$Xu)(class FocusViewAction extends actions_1.$Wu {
                constructor() {
                    const title = (0, nls_1.localize)(4, null, viewDescriptor.name);
                    super({
                        id: viewDescriptor.focusCommand ? viewDescriptor.focusCommand.id : `${viewDescriptor.id}.focus`,
                        title: { original: `Focus on ${viewDescriptor.name} View`, value: title },
                        category,
                        menu: [{
                                id: actions_1.$Ru.CommandPalette,
                                when: viewDescriptor.when,
                            }],
                        keybinding: {
                            when: contextkey_1.$Ii.has(`${viewDescriptor.id}.active`),
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: viewDescriptor.focusCommand?.keybindings?.primary,
                            secondary: viewDescriptor.focusCommand?.keybindings?.secondary,
                            linux: viewDescriptor.focusCommand?.keybindings?.linux,
                            mac: viewDescriptor.focusCommand?.keybindings?.mac,
                            win: viewDescriptor.focusCommand?.keybindings?.win
                        },
                        description: {
                            description: title,
                            args: [
                                {
                                    name: 'focusOptions',
                                    description: 'Focus Options',
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            'preserveFocus': {
                                                type: 'boolean',
                                                default: false
                                            }
                                        },
                                    }
                                }
                            ]
                        }
                    });
                }
                run(accessor, options) {
                    accessor.get(views_1.$$E).openView(viewDescriptor.id, !options?.preserveFocus);
                }
            });
        }
        P(viewDescriptor) {
            return (0, actions_1.$Xu)(class ResetViewLocationAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `${viewDescriptor.id}.resetViewLocation`,
                        title: {
                            original: 'Reset Location',
                            value: (0, nls_1.localize)(5, null)
                        },
                        menu: [{
                                id: actions_1.$Ru.ViewTitleContext,
                                when: contextkey_1.$Ii.or(contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewDescriptor.id), contextkey_1.$Ii.equals(`${viewDescriptor.id}.defaultViewLocation`, false))),
                                group: '1_hide',
                                order: 2
                            }],
                    });
                }
                run(accessor) {
                    const viewDescriptorService = accessor.get(views_1.$_E);
                    const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
                    const containerModel = viewDescriptorService.getViewContainerModel(defaultContainer);
                    // The default container is hidden so we should try to reset its location first
                    if (defaultContainer.hideIfEmpty && containerModel.visibleViewDescriptors.length === 0) {
                        const defaultLocation = viewDescriptorService.getDefaultViewContainerLocation(defaultContainer);
                        viewDescriptorService.moveViewContainerToLocation(defaultContainer, defaultLocation);
                    }
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], viewDescriptorService.getDefaultContainerById(viewDescriptor.id));
                    accessor.get(views_1.$$E).openView(viewDescriptor.id, true);
                }
            });
        }
        Q(viewContainer, viewContainerLocation) {
            const that = this;
            let PaneContainer = class PaneContainer extends panecomposite_1.$Ueb {
                constructor(telemetryService, contextService, storageService, instantiationService, themeService, contextMenuService, extensionService) {
                    super(viewContainer.id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
                }
                m(element) {
                    const viewPaneContainerDisposables = this.B(new lifecycle_1.$jc());
                    // Use composite's instantiation service to get the editor progress service for any editors instantiated within the composite
                    const viewPaneContainer = that.S(element, viewContainer, viewContainerLocation, viewPaneContainerDisposables, this.c);
                    // Only updateTitleArea for non-filter views: microsoft/vscode-remote-release#3676
                    if (!(viewPaneContainer instanceof viewsViewlet_1.$Qeb)) {
                        viewPaneContainerDisposables.add(event_1.Event.any(viewPaneContainer.onDidAddViews, viewPaneContainer.onDidRemoveViews, viewPaneContainer.onTitleAreaUpdate)(() => {
                            // Update title area since there is no better way to update secondary actions
                            this.S();
                        }));
                    }
                    return viewPaneContainer;
                }
            };
            PaneContainer = __decorate([
                __param(0, telemetry_1.$9k),
                __param(1, workspace_1.$Kh),
                __param(2, storage_1.$Vo),
                __param(3, instantiation_1.$Ah),
                __param(4, themeService_1.$gv),
                __param(5, contextView_1.$WZ),
                __param(6, extensions_2.$MF)
            ], PaneContainer);
            platform_1.$8m.as(getPaneCompositeExtension(viewContainerLocation)).registerPaneComposite(panecomposite_1.$Veb.create(PaneContainer, viewContainer.id, typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, (0, types_1.$jf)(viewContainer.icon) ? viewContainer.icon : undefined, viewContainer.order, viewContainer.requestedIndex, viewContainer.icon instanceof uri_1.URI ? viewContainer.icon : undefined));
        }
        R(viewContainer, viewContainerLocation) {
            platform_1.$8m.as(getPaneCompositeExtension(viewContainerLocation)).deregisterPaneComposite(viewContainer.id);
        }
        S(element, viewContainer, viewContainerLocation, disposables, instantiationService) {
            const viewPaneContainer = instantiationService.createInstance(viewContainer.ctorDescriptor.ctor, ...(viewContainer.ctorDescriptor.staticArguments || []));
            this.b.set(viewPaneContainer.getId(), viewPaneContainer);
            disposables.add((0, lifecycle_1.$ic)(() => this.b.delete(viewPaneContainer.getId())));
            disposables.add(viewPaneContainer.onDidAddViews(views => this.t(views)));
            disposables.add(viewPaneContainer.onDidChangeViewVisibility(view => this.u(view, view.isBodyVisible())));
            disposables.add(viewPaneContainer.onDidRemoveViews(views => this.w(views)));
            disposables.add(viewPaneContainer.onDidFocusView(view => {
                if (this.j.get() !== view.id) {
                    this.j.set(view.id);
                    this.g.fire();
                }
            }));
            disposables.add(viewPaneContainer.onDidBlurView(view => {
                if (this.j.get() === view.id) {
                    this.j.reset();
                    this.g.fire();
                }
            }));
            return viewPaneContainer;
        }
    };
    exports.$gyb = $gyb;
    exports.$gyb = $gyb = __decorate([
        __param(0, views_1.$_E),
        __param(1, panecomposite_2.$Yeb),
        __param(2, contextkey_1.$3i),
        __param(3, layoutService_1.$Meb)
    ], $gyb);
    function getPaneCompositeExtension(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                return panecomposite_1.$Web.Auxiliary;
            case 1 /* ViewContainerLocation.Panel */:
                return panecomposite_1.$Web.Panels;
            case 0 /* ViewContainerLocation.Sidebar */:
            default:
                return panecomposite_1.$Web.Viewlets;
        }
    }
    function $hyb(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                return "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
            case 1 /* ViewContainerLocation.Panel */:
                return "workbench.parts.panel" /* Parts.PANEL_PART */;
            case 0 /* ViewContainerLocation.Sidebar */:
            default:
                return "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
        }
    }
    exports.$hyb = $hyb;
    (0, extensions_1.$mr)(views_1.$$E, $gyb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=viewsService.js.map