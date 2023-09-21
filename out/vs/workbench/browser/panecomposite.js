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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/browser/composite", "vs/platform/instantiation/common/instantiation", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/services/extensions/common/extensions", "vs/workbench/browser/parts/views/viewPane"], function (require, exports, platform_1, composite_1, instantiation_1, actions_1, actions_2, contextView_1, storage_1, telemetry_1, themeService_1, workspace_1, viewPaneContainer_1, extensions_1, viewPane_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PaneCompositeRegistry = exports.Extensions = exports.PaneCompositeDescriptor = exports.PaneComposite = void 0;
    let PaneComposite = class PaneComposite extends composite_1.Composite {
        constructor(id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService) {
            super(id, telemetryService, themeService, storageService);
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.extensionService = extensionService;
            this.contextService = contextService;
        }
        create(parent) {
            this.viewPaneContainer = this._register(this.createViewPaneContainer(parent));
            this._register(this.viewPaneContainer.onTitleAreaUpdate(() => this.updateTitleArea()));
            this.viewPaneContainer.create(parent);
        }
        setVisible(visible) {
            super.setVisible(visible);
            this.viewPaneContainer?.setVisible(visible);
        }
        layout(dimension) {
            this.viewPaneContainer?.layout(dimension);
        }
        setBoundarySashes(sashes) {
            this.viewPaneContainer?.setBoundarySashes(sashes);
        }
        getOptimalWidth() {
            return this.viewPaneContainer?.getOptimalWidth() ?? 0;
        }
        openView(id, focus) {
            return this.viewPaneContainer?.openView(id, focus);
        }
        getViewPaneContainer() {
            return this.viewPaneContainer;
        }
        getActionsContext() {
            return this.getViewPaneContainer()?.getActionsContext();
        }
        getContextMenuActions() {
            return this.viewPaneContainer?.menuActions?.getContextMenuActions() ?? [];
        }
        getMenuIds() {
            const result = [];
            if (this.viewPaneContainer?.menuActions) {
                result.push(this.viewPaneContainer.menuActions.menuId);
                if (this.viewPaneContainer.isViewMergedWithContainer()) {
                    result.push(this.viewPaneContainer.panes[0].menuActions.menuId);
                }
            }
            return result;
        }
        getActions() {
            const result = [];
            if (this.viewPaneContainer?.menuActions) {
                result.push(...this.viewPaneContainer.menuActions.getPrimaryActions());
                if (this.viewPaneContainer.isViewMergedWithContainer()) {
                    const viewPane = this.viewPaneContainer.panes[0];
                    if (viewPane.shouldShowFilterInHeader()) {
                        result.push(viewPane_1.VIEWPANE_FILTER_ACTION);
                    }
                    result.push(...viewPane.menuActions.getPrimaryActions());
                }
            }
            return result;
        }
        getSecondaryActions() {
            if (!this.viewPaneContainer?.menuActions) {
                return [];
            }
            const viewPaneActions = this.viewPaneContainer.isViewMergedWithContainer() ? this.viewPaneContainer.panes[0].menuActions.getSecondaryActions() : [];
            let menuActions = this.viewPaneContainer.menuActions.getSecondaryActions();
            const viewsSubmenuActionIndex = menuActions.findIndex(action => action instanceof actions_2.SubmenuItemAction && action.item.submenu === viewPaneContainer_1.ViewsSubMenu);
            if (viewsSubmenuActionIndex !== -1) {
                const viewsSubmenuAction = menuActions[viewsSubmenuActionIndex];
                if (viewsSubmenuAction.actions.some(({ enabled }) => enabled)) {
                    if (menuActions.length === 1 && viewPaneActions.length === 0) {
                        menuActions = viewsSubmenuAction.actions.slice();
                    }
                    else if (viewsSubmenuActionIndex !== 0) {
                        menuActions = [viewsSubmenuAction, ...menuActions.slice(0, viewsSubmenuActionIndex), ...menuActions.slice(viewsSubmenuActionIndex + 1)];
                    }
                }
                else {
                    // Remove views submenu if none of the actions are enabled
                    menuActions.splice(viewsSubmenuActionIndex, 1);
                }
            }
            if (menuActions.length && viewPaneActions.length) {
                return [
                    ...menuActions,
                    new actions_1.Separator(),
                    ...viewPaneActions
                ];
            }
            return menuActions.length ? menuActions : viewPaneActions;
        }
        getActionViewItem(action) {
            return this.viewPaneContainer?.getActionViewItem(action);
        }
        getTitle() {
            return this.viewPaneContainer?.getTitle() ?? '';
        }
        focus() {
            this.viewPaneContainer?.focus();
        }
    };
    exports.PaneComposite = PaneComposite;
    exports.PaneComposite = PaneComposite = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, storage_1.IStorageService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, extensions_1.IExtensionService),
        __param(7, workspace_1.IWorkspaceContextService)
    ], PaneComposite);
    /**
     * A Pane Composite descriptor is a lightweight descriptor of a Pane Composite in the workbench.
     */
    class PaneCompositeDescriptor extends composite_1.CompositeDescriptor {
        static create(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
            return new PaneCompositeDescriptor(ctor, id, name, cssClass, order, requestedIndex, iconUrl);
        }
        constructor(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
            super(ctor, id, name, cssClass, order, requestedIndex);
            this.iconUrl = iconUrl;
        }
    }
    exports.PaneCompositeDescriptor = PaneCompositeDescriptor;
    exports.Extensions = {
        Viewlets: 'workbench.contributions.viewlets',
        Panels: 'workbench.contributions.panels',
        Auxiliary: 'workbench.contributions.auxiliary',
    };
    class PaneCompositeRegistry extends composite_1.CompositeRegistry {
        /**
         * Registers a viewlet to the platform.
         */
        registerPaneComposite(descriptor) {
            super.registerComposite(descriptor);
        }
        /**
         * Deregisters a viewlet to the platform.
         */
        deregisterPaneComposite(id) {
            super.deregisterComposite(id);
        }
        /**
         * Returns the viewlet descriptor for the given id or null if none.
         */
        getPaneComposite(id) {
            return this.getComposite(id);
        }
        /**
         * Returns an array of registered viewlets known to the platform.
         */
        getPaneComposites() {
            return this.getComposites();
        }
    }
    exports.PaneCompositeRegistry = PaneCompositeRegistry;
    platform_1.Registry.add(exports.Extensions.Viewlets, new PaneCompositeRegistry());
    platform_1.Registry.add(exports.Extensions.Panels, new PaneCompositeRegistry());
    platform_1.Registry.add(exports.Extensions.Auxiliary, new PaneCompositeRegistry());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWNvbXBvc2l0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhbmVjb21wb3NpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0J6RixJQUFlLGFBQWEsR0FBNUIsTUFBZSxhQUFjLFNBQVEscUJBQVM7UUFJcEQsWUFDQyxFQUFVLEVBQ1MsZ0JBQW1DLEVBQzNCLGNBQStCLEVBQ3pCLG9CQUEyQyxFQUM3RCxZQUEyQixFQUNYLGtCQUF1QyxFQUN6QyxnQkFBbUMsRUFDNUIsY0FBd0M7WUFFNUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFQL0IsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3pCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFN0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN6QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQzVCLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtRQUc3RSxDQUFDO1FBRVEsTUFBTSxDQUFDLE1BQW1CO1lBQ2xDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRVEsVUFBVSxDQUFDLE9BQWdCO1lBQ25DLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFD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