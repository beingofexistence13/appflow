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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/contextkey/common/contextkey", "vs/base/common/event", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/nls", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/contextview/browser/contextView", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/workbench/browser/panecomposite", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/uri", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, lifecycle_1, views_1, contextkeys_1, platform_1, storage_1, contextkey_1, event_1, types_1, actions_1, nls_1, extensions_1, instantiation_1, telemetry_1, themeService_1, contextView_1, extensions_2, workspace_1, panecomposite_1, layoutService_1, uri_1, actionCommonCategories_1, editorGroupsService_1, viewsViewlet_1, panecomposite_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPartByLocation = exports.ViewsService = void 0;
    let ViewsService = class ViewsService extends lifecycle_1.Disposable {
        constructor(viewDescriptorService, paneCompositeService, contextKeyService, layoutService) {
            super();
            this.viewDescriptorService = viewDescriptorService;
            this.paneCompositeService = paneCompositeService;
            this.contextKeyService = contextKeyService;
            this.layoutService = layoutService;
            this._onDidChangeViewVisibility = this._register(new event_1.Emitter());
            this.onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
            this._onDidChangeViewContainerVisibility = this._register(new event_1.Emitter());
            this.onDidChangeViewContainerVisibility = this._onDidChangeViewContainerVisibility.event;
            this._onDidChangeFocusedView = this._register(new event_1.Emitter());
            this.onDidChangeFocusedView = this._onDidChangeFocusedView.event;
            this.viewDisposable = new Map();
            this.visibleViewContextKeys = new Map();
            this.viewPaneContainers = new Map();
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.viewDisposable.forEach(disposable => disposable.dispose());
                this.viewDisposable.clear();
            }));
            this.viewDescriptorService.viewContainers.forEach(viewContainer => this.onDidRegisterViewContainer(viewContainer, this.viewDescriptorService.getViewContainerLocation(viewContainer)));
            this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeContainers(added, removed)));
            this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.onDidChangeContainerLocation(viewContainer, from, to)));
            // View Container Visibility
            this._register(this.paneCompositeService.onDidPaneCompositeOpen(e => this._onDidChangeViewContainerVisibility.fire({ id: e.composite.getId(), visible: true, location: e.viewContainerLocation })));
            this._register(this.paneCompositeService.onDidPaneCompositeClose(e => this._onDidChangeViewContainerVisibility.fire({ id: e.composite.getId(), visible: false, location: e.viewContainerLocation })));
            this.focusedViewContextKey = contextkeys_1.FocusedViewContext.bindTo(contextKeyService);
        }
        onViewsAdded(added) {
            for (const view of added) {
                this.onViewsVisibilityChanged(view, view.isBodyVisible());
            }
        }
        onViewsVisibilityChanged(view, visible) {
            this.getOrCreateActiveViewContextKey(view).set(visible);
            this._onDidChangeViewVisibility.fire({ id: view.id, visible: visible });
        }
        onViewsRemoved(removed) {
            for (const view of removed) {
                this.onViewsVisibilityChanged(view, false);
            }
        }
        getOrCreateActiveViewContextKey(view) {
            const visibleContextKeyId = (0, contextkeys_1.getVisbileViewContextKey)(view.id);
            let contextKey = this.visibleViewContextKeys.get(visibleContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(visibleContextKeyId, false).bindTo(this.contextKeyService);
                this.visibleViewContextKeys.set(visibleContextKeyId, contextKey);
            }
            return contextKey;
        }
        onDidChangeContainers(added, removed) {
            for (const { container, location } of removed) {
                this.deregisterPaneComposite(container, location);
            }
            for (const { container, location } of added) {
                this.onDidRegisterViewContainer(container, location);
            }
        }
        onDidRegisterViewContainer(viewContainer, viewContainerLocation) {
            this.registerPaneComposite(viewContainer, viewContainerLocation);
            const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
            this.onViewDescriptorsAdded(viewContainerModel.allViewDescriptors, viewContainer);
            this._register(viewContainerModel.onDidChangeAllViewDescriptors(({ added, removed }) => {
                this.onViewDescriptorsAdded(added, viewContainer);
                this.onViewDescriptorsRemoved(removed);
            }));
            this._register(this.registerOpenViewContainerAction(viewContainer));
        }
        onDidChangeContainerLocation(viewContainer, from, to) {
            this.deregisterPaneComposite(viewContainer, from);
            this.registerPaneComposite(viewContainer, to);
        }
        onViewDescriptorsAdded(views, container) {
            const location = this.viewDescriptorService.getViewContainerLocation(container);
            if (location === null) {
                return;
            }
            const composite = this.getComposite(container.id, location);
            for (const viewDescriptor of views) {
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(this.registerOpenViewAction(viewDescriptor));
                disposables.add(this.registerFocusViewAction(viewDescriptor, composite?.name && composite.name !== composite.id ? composite.name : actionCommonCategories_1.Categories.View));
                disposables.add(this.registerResetViewLocationAction(viewDescriptor));
                this.viewDisposable.set(viewDescriptor, disposables);
            }
        }
        onViewDescriptorsRemoved(views) {
            for (const view of views) {
                const disposable = this.viewDisposable.get(view);
                if (disposable) {
                    disposable.dispose();
                    this.viewDisposable.delete(view);
                }
            }
        }
        async openComposite(compositeId, location, focus) {
            return this.paneCompositeService.openPaneComposite(compositeId, location, focus);
        }
        getComposite(compositeId, location) {
            return this.paneCompositeService.getPaneComposite(compositeId, location);
        }
        isViewContainerVisible(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                if (viewContainerLocation !== null) {
                    return this.paneCompositeService.getActivePaneComposite(viewContainerLocation)?.getId() === id;
                }
            }
            return false;
        }
        getVisibleViewContainer(location) {
            const viewContainerId = this.paneCompositeService.getActivePaneComposite(location)?.getId();
            return viewContainerId ? this.viewDescriptorService.getViewContainerById(viewContainerId) : null;
        }
        getActiveViewPaneContainerWithId(viewContainerId) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
            return viewContainer ? this.getActiveViewPaneContainer(viewContainer) : null;
        }
        async openViewContainer(id, focus) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                if (viewContainerLocation !== null) {
                    const paneComposite = await this.paneCompositeService.openPaneComposite(id, viewContainerLocation, focus);
                    return paneComposite || null;
                }
            }
            return null;
        }
        async closeViewContainer(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                const isActive = viewContainerLocation !== null && this.paneCompositeService.getActivePaneComposite(viewContainerLocation);
                if (viewContainerLocation !== null) {
                    return isActive ? this.layoutService.setPartHidden(true, getPartByLocation(viewContainerLocation)) : undefined;
                }
            }
        }
        isViewVisible(id) {
            const activeView = this.getActiveViewWithId(id);
            return activeView?.isBodyVisible() || false;
        }
        getActiveViewWithId(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
                if (activeViewPaneContainer) {
                    return activeViewPaneContainer.getView(id);
                }
            }
            return null;
        }
        getViewWithId(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
                if (viewPaneContainer) {
                    return viewPaneContainer.getView(id);
                }
            }
            return null;
        }
        getFocusedViewName() {
            const viewId = this.contextKeyService.getContextKeyValue(contextkeys_1.FocusedViewContext.key) ?? '';
            return this.viewDescriptorService.getViewDescriptorById(viewId.toString())?.name ?? '';
        }
        async openView(id, focus) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (!viewContainer) {
                return null;
            }
            if (!this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.some(viewDescriptor => viewDescriptor.id === id)) {
                return null;
            }
            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            const compositeDescriptor = this.getComposite(viewContainer.id, location);
            if (compositeDescriptor) {
                const paneComposite = await this.openComposite(compositeDescriptor.id, location);
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
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
                if (activeViewPaneContainer) {
                    const view = activeViewPaneContainer.getView(id);
                    if (view) {
                        if (activeViewPaneContainer.views.length === 1) {
                            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                            if (location === 0 /* ViewContainerLocation.Sidebar */) {
                                this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                            }
                            else if (location === 1 /* ViewContainerLocation.Panel */ || location === 2 /* ViewContainerLocation.AuxiliaryBar */) {
                                this.paneCompositeService.hideActivePaneComposite(location);
                            }
                            // The blur event doesn't fire on WebKit when the focused element is hidden,
                            // so the context key needs to be forced here too otherwise a view may still
                            // think it's showing, breaking toggle commands.
                            if (this.focusedViewContextKey.get() === id) {
                                this.focusedViewContextKey.reset();
                            }
                        }
                        else {
                            view.setExpanded(false);
                        }
                    }
                }
            }
        }
        getActiveViewPaneContainer(viewContainer) {
            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            if (location === null) {
                return null;
            }
            const activePaneComposite = this.paneCompositeService.getActivePaneComposite(location);
            if (activePaneComposite?.getId() === viewContainer.id) {
                return activePaneComposite.getViewPaneContainer() || null;
            }
            return null;
        }
        getViewProgressIndicator(viewId) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(viewId);
            if (!viewContainer) {
                return undefined;
            }
            const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
            if (!viewPaneContainer) {
                return undefined;
            }
            const view = viewPaneContainer.getView(viewId);
            if (!view) {
                return undefined;
            }
            if (viewPaneContainer.isViewMergedWithContainer()) {
                return this.getViewContainerProgressIndicator(viewContainer);
            }
            return view.getProgressIndicator();
        }
        getViewContainerProgressIndicator(viewContainer) {
            const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            if (viewContainerLocation === null) {
                return undefined;
            }
            return this.paneCompositeService.getProgressIndicator(viewContainer.id, viewContainerLocation);
        }
        registerOpenViewContainerAction(viewContainer) {
            const disposables = new lifecycle_1.DisposableStore();
            if (viewContainer.openCommandActionDescriptor) {
                const { id, mnemonicTitle, keybindings, order } = viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id };
                const title = viewContainer.openCommandActionDescriptor.title ?? viewContainer.title;
                const that = this;
                disposables.add((0, actions_1.registerAction2)(class OpenViewContainerAction extends actions_1.Action2 {
                    constructor() {
                        super({
                            id,
                            get title() {
                                const viewContainerLocation = that.viewDescriptorService.getViewContainerLocation(viewContainer);
                                const localizedTitle = typeof title === 'string' ? title : title.value;
                                const originalTitle = typeof title === 'string' ? title : title.original;
                                if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                                    return { value: (0, nls_1.localize)('show view', "Show {0}", localizedTitle), original: `Show ${originalTitle}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)('toggle view', "Toggle {0}", localizedTitle), original: `Toggle ${originalTitle}` };
                                }
                            },
                            category: actionCommonCategories_1.Categories.View,
                            precondition: contextkey_1.ContextKeyExpr.has((0, contextkeys_1.getEnabledViewContainerContextKey)(viewContainer.id)),
                            keybinding: keybindings ? { ...keybindings, weight: 200 /* KeybindingWeight.WorkbenchContrib */ } : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.IEditorGroupsService);
                        const viewDescriptorService = serviceAccessor.get(views_1.IViewDescriptorService);
                        const layoutService = serviceAccessor.get(layoutService_1.IWorkbenchLayoutService);
                        const viewsService = serviceAccessor.get(views_1.IViewsService);
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
                    const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
                    disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
                        command: {
                            id,
                            title: mnemonicTitle,
                        },
                        group: defaultLocation === 0 /* ViewContainerLocation.Sidebar */ ? '3_views' : '4_panels',
                        when: contextkey_1.ContextKeyExpr.has((0, contextkeys_1.getEnabledViewContainerContextKey)(viewContainer.id)),
                        order: order ?? Number.MAX_VALUE
                    }));
                }
            }
            return disposables;
        }
        registerOpenViewAction(viewDescriptor) {
            const disposables = new lifecycle_1.DisposableStore();
            if (viewDescriptor.openCommandActionDescriptor) {
                const title = viewDescriptor.openCommandActionDescriptor.title ?? viewDescriptor.name;
                const commandId = viewDescriptor.openCommandActionDescriptor.id;
                const that = this;
                disposables.add((0, actions_1.registerAction2)(class OpenViewAction extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: commandId,
                            get title() {
                                const viewContainerLocation = that.viewDescriptorService.getViewLocationById(viewDescriptor.id);
                                const localizedTitle = typeof title === 'string' ? title : title.value;
                                const originalTitle = typeof title === 'string' ? title : title.original;
                                if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                                    return { value: (0, nls_1.localize)('show view', "Show {0}", localizedTitle), original: `Show ${originalTitle}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)('toggle view', "Toggle {0}", localizedTitle), original: `Toggle ${originalTitle}` };
                                }
                            },
                            category: actionCommonCategories_1.Categories.View,
                            precondition: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.active`),
                            keybinding: viewDescriptor.openCommandActionDescriptor.keybindings ? { ...viewDescriptor.openCommandActionDescriptor.keybindings, weight: 200 /* KeybindingWeight.WorkbenchContrib */ } : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.IEditorGroupsService);
                        const viewDescriptorService = serviceAccessor.get(views_1.IViewDescriptorService);
                        const layoutService = serviceAccessor.get(layoutService_1.IWorkbenchLayoutService);
                        const viewsService = serviceAccessor.get(views_1.IViewsService);
                        const contextKeyService = serviceAccessor.get(contextkey_1.IContextKeyService);
                        const focusedViewId = contextkeys_1.FocusedViewContext.getValue(contextKeyService);
                        if (focusedViewId === viewDescriptor.id) {
                            const viewLocation = viewDescriptorService.getViewLocationById(viewDescriptor.id);
                            if (viewDescriptorService.getViewLocationById(viewDescriptor.id) === 0 /* ViewContainerLocation.Sidebar */) {
                                // focus the editor if the view is focused and in the side bar
                                editorGroupService.activeGroup.focus();
                            }
                            else if (viewLocation !== null) {
                                // otherwise hide the part where the view lives if focused
                                layoutService.setPartHidden(true, getPartByLocation(viewLocation));
                            }
                        }
                        else {
                            viewsService.openView(viewDescriptor.id, true);
                        }
                    }
                }));
                if (viewDescriptor.openCommandActionDescriptor.mnemonicTitle) {
                    const defaultViewContainer = this.viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
                    if (defaultViewContainer) {
                        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(defaultViewContainer);
                        disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
                            command: {
                                id: commandId,
                                title: viewDescriptor.openCommandActionDescriptor.mnemonicTitle,
                            },
                            group: defaultLocation === 0 /* ViewContainerLocation.Sidebar */ ? '3_views' : '4_panels',
                            when: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.active`),
                            order: viewDescriptor.openCommandActionDescriptor.order ?? Number.MAX_VALUE
                        }));
                    }
                }
            }
            return disposables;
        }
        registerFocusViewAction(viewDescriptor, category) {
            return (0, actions_1.registerAction2)(class FocusViewAction extends actions_1.Action2 {
                constructor() {
                    const title = (0, nls_1.localize)({ key: 'focus view', comment: ['{0} indicates the name of the view to be focused.'] }, "Focus on {0} View", viewDescriptor.name);
                    super({
                        id: viewDescriptor.focusCommand ? viewDescriptor.focusCommand.id : `${viewDescriptor.id}.focus`,
                        title: { original: `Focus on ${viewDescriptor.name} View`, value: title },
                        category,
                        menu: [{
                                id: actions_1.MenuId.CommandPalette,
                                when: viewDescriptor.when,
                            }],
                        keybinding: {
                            when: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.active`),
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
                    accessor.get(views_1.IViewsService).openView(viewDescriptor.id, !options?.preserveFocus);
                }
            });
        }
        registerResetViewLocationAction(viewDescriptor) {
            return (0, actions_1.registerAction2)(class ResetViewLocationAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `${viewDescriptor.id}.resetViewLocation`,
                        title: {
                            original: 'Reset Location',
                            value: (0, nls_1.localize)('resetViewLocation', "Reset Location")
                        },
                        menu: [{
                                id: actions_1.MenuId.ViewTitleContext,
                                when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewDescriptor.id), contextkey_1.ContextKeyExpr.equals(`${viewDescriptor.id}.defaultViewLocation`, false))),
                                group: '1_hide',
                                order: 2
                            }],
                    });
                }
                run(accessor) {
                    const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
                    const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
                    const containerModel = viewDescriptorService.getViewContainerModel(defaultContainer);
                    // The default container is hidden so we should try to reset its location first
                    if (defaultContainer.hideIfEmpty && containerModel.visibleViewDescriptors.length === 0) {
                        const defaultLocation = viewDescriptorService.getDefaultViewContainerLocation(defaultContainer);
                        viewDescriptorService.moveViewContainerToLocation(defaultContainer, defaultLocation);
                    }
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], viewDescriptorService.getDefaultContainerById(viewDescriptor.id));
                    accessor.get(views_1.IViewsService).openView(viewDescriptor.id, true);
                }
            });
        }
        registerPaneComposite(viewContainer, viewContainerLocation) {
            const that = this;
            let PaneContainer = class PaneContainer extends panecomposite_1.PaneComposite {
                constructor(telemetryService, contextService, storageService, instantiationService, themeService, contextMenuService, extensionService) {
                    super(viewContainer.id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
                }
                createViewPaneContainer(element) {
                    const viewPaneContainerDisposables = this._register(new lifecycle_1.DisposableStore());
                    // Use composite's instantiation service to get the editor progress service for any editors instantiated within the composite
                    const viewPaneContainer = that.createViewPaneContainer(element, viewContainer, viewContainerLocation, viewPaneContainerDisposables, this.instantiationService);
                    // Only updateTitleArea for non-filter views: microsoft/vscode-remote-release#3676
                    if (!(viewPaneContainer instanceof viewsViewlet_1.FilterViewPaneContainer)) {
                        viewPaneContainerDisposables.add(event_1.Event.any(viewPaneContainer.onDidAddViews, viewPaneContainer.onDidRemoveViews, viewPaneContainer.onTitleAreaUpdate)(() => {
                            // Update title area since there is no better way to update secondary actions
                            this.updateTitleArea();
                        }));
                    }
                    return viewPaneContainer;
                }
            };
            PaneContainer = __decorate([
                __param(0, telemetry_1.ITelemetryService),
                __param(1, workspace_1.IWorkspaceContextService),
                __param(2, storage_1.IStorageService),
                __param(3, instantiation_1.IInstantiationService),
                __param(4, themeService_1.IThemeService),
                __param(5, contextView_1.IContextMenuService),
                __param(6, extensions_2.IExtensionService)
            ], PaneContainer);
            platform_1.Registry.as(getPaneCompositeExtension(viewContainerLocation)).registerPaneComposite(panecomposite_1.PaneCompositeDescriptor.create(PaneContainer, viewContainer.id, typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, (0, types_1.isString)(viewContainer.icon) ? viewContainer.icon : undefined, viewContainer.order, viewContainer.requestedIndex, viewContainer.icon instanceof uri_1.URI ? viewContainer.icon : undefined));
        }
        deregisterPaneComposite(viewContainer, viewContainerLocation) {
            platform_1.Registry.as(getPaneCompositeExtension(viewContainerLocation)).deregisterPaneComposite(viewContainer.id);
        }
        createViewPaneContainer(element, viewContainer, viewContainerLocation, disposables, instantiationService) {
            const viewPaneContainer = instantiationService.createInstance(viewContainer.ctorDescriptor.ctor, ...(viewContainer.ctorDescriptor.staticArguments || []));
            this.viewPaneContainers.set(viewPaneContainer.getId(), viewPaneContainer);
            disposables.add((0, lifecycle_1.toDisposable)(() => this.viewPaneContainers.delete(viewPaneContainer.getId())));
            disposables.add(viewPaneContainer.onDidAddViews(views => this.onViewsAdded(views)));
            disposables.add(viewPaneContainer.onDidChangeViewVisibility(view => this.onViewsVisibilityChanged(view, view.isBodyVisible())));
            disposables.add(viewPaneContainer.onDidRemoveViews(views => this.onViewsRemoved(views)));
            disposables.add(viewPaneContainer.onDidFocusView(view => {
                if (this.focusedViewContextKey.get() !== view.id) {
                    this.focusedViewContextKey.set(view.id);
                    this._onDidChangeFocusedView.fire();
                }
            }));
            disposables.add(viewPaneContainer.onDidBlurView(view => {
                if (this.focusedViewContextKey.get() === view.id) {
                    this.focusedViewContextKey.reset();
                    this._onDidChangeFocusedView.fire();
                }
            }));
            return viewPaneContainer;
        }
    };
    exports.ViewsService = ViewsService;
    exports.ViewsService = ViewsService = __decorate([
        __param(0, views_1.IViewDescriptorService),
        __param(1, panecomposite_2.IPaneCompositePartService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, layoutService_1.IWorkbenchLayoutService)
    ], ViewsService);
    function getPaneCompositeExtension(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                return panecomposite_1.Extensions.Auxiliary;
            case 1 /* ViewContainerLocation.Panel */:
                return panecomposite_1.Extensions.Panels;
            case 0 /* ViewContainerLocation.Sidebar */:
            default:
                return panecomposite_1.Extensions.Viewlets;
        }
    }
    function getPartByLocation(viewContainerLocation) {
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
    exports.getPartByLocation = getPartByLocation;
    (0, extensions_1.registerSingleton)(views_1.IViewsService, ViewsService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvdmlld3Mvdmlld3NTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdDekYsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLHNCQUFVO1FBbUIzQyxZQUN5QixxQkFBOEQsRUFDM0Qsb0JBQWdFLEVBQ3ZFLGlCQUFzRCxFQUNqRCxhQUF1RDtZQUVoRixLQUFLLEVBQUUsQ0FBQztZQUxpQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQzFDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7WUFDdEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNoQyxrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFoQmhFLCtCQUEwQixHQUE4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFvQyxDQUFDLENBQUM7WUFDaEosOEJBQXlCLEdBQTRDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUFFbkcsd0NBQW1DLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBcUUsQ0FBQyxDQUFDO1lBQy9JLHVDQUFrQyxHQUFHLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxLQUFLLENBQUM7WUFFNUUsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDdEUsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQWFwRSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBQzlELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztZQUN0RSxJQUFJLENBQUMs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