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
    exports.$Xeb = exports.$Web = exports.$Veb = exports.$Ueb = void 0;
    let $Ueb = class $Ueb extends composite_1.$1T {
        constructor(id, telemetryService, b, c, themeService, f, g, j) {
            super(id, telemetryService, themeService, b);
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.j = j;
        }
        create(parent) {
            this.a = this.B(this.m(parent));
            this.B(this.a.onTitleAreaUpdate(() => this.S()));
            this.a.create(parent);
        }
        setVisible(visible) {
            super.setVisible(visible);
            this.a?.setVisible(visible);
        }
        layout(dimension) {
            this.a?.layout(dimension);
        }
        setBoundarySashes(sashes) {
            this.a?.setBoundarySashes(sashes);
        }
        getOptimalWidth() {
            return this.a?.getOptimalWidth() ?? 0;
        }
        openView(id, focus) {
            return this.a?.openView(id, focus);
        }
        getViewPaneContainer() {
            return this.a;
        }
        getActionsContext() {
            return this.getViewPaneContainer()?.getActionsContext();
        }
        getContextMenuActions() {
            return this.a?.menuActions?.getContextMenuActions() ?? [];
        }
        getMenuIds() {
            const result = [];
            if (this.a?.menuActions) {
                result.push(this.a.menuActions.menuId);
                if (this.a.isViewMergedWithContainer()) {
                    result.push(this.a.panes[0].menuActions.menuId);
                }
            }
            return result;
        }
        getActions() {
            const result = [];
            if (this.a?.menuActions) {
                result.push(...this.a.menuActions.getPrimaryActions());
                if (this.a.isViewMergedWithContainer()) {
                    const viewPane = this.a.panes[0];
                    if (viewPane.shouldShowFilterInHeader()) {
                        result.push(viewPane_1.$Heb);
                    }
                    result.push(...viewPane.menuActions.getPrimaryActions());
                }
            }
            return result;
        }
        getSecondaryActions() {
            if (!this.a?.menuActions) {
                return [];
            }
            const viewPaneActions = this.a.isViewMergedWithContainer() ? this.a.panes[0].menuActions.getSecondaryActions() : [];
            let menuActions = this.a.menuActions.getSecondaryActions();
            const viewsSubmenuActionIndex = menuActions.findIndex(action => action instanceof actions_2.$Uu && action.item.submenu === viewPaneContainer_1.$Reb);
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
                    new actions_1.$ii(),
                    ...viewPaneActions
                ];
            }
            return menuActions.length ? menuActions : viewPaneActions;
        }
        getActionViewItem(action) {
            return this.a?.getActionViewItem(action);
        }
        getTitle() {
            return this.a?.getTitle() ?? '';
        }
        focus() {
            this.a?.focus();
        }
    };
    exports.$Ueb = $Ueb;
    exports.$Ueb = $Ueb = __decorate([
        __param(1, telemetry_1.$9k),
        __param(2, storage_1.$Vo),
        __param(3, instantiation_1.$Ah),
        __param(4, themeService_1.$gv),
        __param(5, contextView_1.$WZ),
        __param(6, extensions_1.$MF),
        __param(7, workspace_1.$Kh)
    ], $Ueb);
    /**
     * A Pane Composite descriptor is a lightweight descriptor of a Pane Composite in the workbench.
     */
    class $Veb extends composite_1.$2T {
        static create(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
            return new $Veb(ctor, id, name, cssClass, order, requestedIndex, iconUrl);
        }
        constructor(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
            super(ctor, id, name, cssClass, order, requestedIndex);
            this.iconUrl = iconUrl;
        }
    }
    exports.$Veb = $Veb;
    exports.$Web = {
        Viewlets: 'workbench.contributions.viewlets',
        Panels: 'workbench.contributions.panels',
        Auxiliary: 'workbench.contributions.auxiliary',
    };
    class $Xeb extends composite_1.$3T {
        /**
         * Registers a viewlet to the platform.
         */
        registerPaneComposite(descriptor) {
            super.f(descriptor);
        }
        /**
         * Deregisters a viewlet to the platform.
         */
        deregisterPaneComposite(id) {
            super.g(id);
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
            return this.h();
        }
    }
    exports.$Xeb = $Xeb;
    platform_1.$8m.add(exports.$Web.Viewlets, new $Xeb());
    platform_1.$8m.add(exports.$Web.Panels, new $Xeb());
    platform_1.$8m.add(exports.$Web.Auxiliary, new $Xeb());
});
//# sourceMappingURL=panecomposite.js.map