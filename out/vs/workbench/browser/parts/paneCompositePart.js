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
define(["require", "exports", "vs/base/common/event", "vs/base/common/types", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/activitybar/activitybarPart", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart", "vs/workbench/browser/parts/panel/panelPart", "vs/workbench/browser/parts/sidebar/sidebarPart", "vs/workbench/common/views", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/lifecycle"], function (require, exports, event_1, types_1, extensions_1, instantiation_1, activitybarPart_1, auxiliaryBarPart_1, panelPart_1, sidebarPart_1, views_1, panecomposite_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PaneCompositeParts = void 0;
    let PaneCompositeParts = class PaneCompositeParts extends lifecycle_1.Disposable {
        constructor(instantiationService) {
            super();
            this.paneCompositeParts = new Map();
            this.paneCompositeSelectorParts = new Map();
            const panelPart = instantiationService.createInstance(panelPart_1.PanelPart);
            const sideBarPart = instantiationService.createInstance(sidebarPart_1.SidebarPart);
            const auxiliaryBarPart = instantiationService.createInstance(auxiliaryBarPart_1.AuxiliaryBarPart);
            const activityBarPart = instantiationService.createInstance(activitybarPart_1.ActivitybarPart, sideBarPart);
            this.paneCompositeParts.set(1 /* ViewContainerLocation.Panel */, panelPart);
            this.paneCompositeParts.set(0 /* ViewContainerLocation.Sidebar */, sideBarPart);
            this.paneCompositeParts.set(2 /* ViewContainerLocation.AuxiliaryBar */, auxiliaryBarPart);
            this.paneCompositeSelectorParts.set(1 /* ViewContainerLocation.Panel */, panelPart);
            this.paneCompositeSelectorParts.set(0 /* ViewContainerLocation.Sidebar */, activityBarPart);
            this.paneCompositeSelectorParts.set(2 /* ViewContainerLocation.AuxiliaryBar */, auxiliaryBarPart);
            const eventDisposables = this._register(new lifecycle_1.DisposableStore());
            this.onDidPaneCompositeOpen = event_1.Event.any(...views_1.ViewContainerLocations.map(loc => event_1.Event.map(this.paneCompositeParts.get(loc).onDidPaneCompositeOpen, composite => { return { composite, viewContainerLocation: loc }; }, eventDisposables)));
            this.onDidPaneCompositeClose = event_1.Event.any(...views_1.ViewContainerLocations.map(loc => event_1.Event.map(this.paneCompositeParts.get(loc).onDidPaneCompositeClose, composite => { return { composite, viewContainerLocation: loc }; }, eventDisposables)));
        }
        openPaneComposite(id, viewContainerLocation, focus) {
            return this.getPartByLocation(viewContainerLocation).openPaneComposite(id, focus);
        }
        getActivePaneComposite(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getActivePaneComposite();
        }
        getPaneComposite(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposite(id);
        }
        getPaneComposites(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposites();
        }
        getPinnedPaneCompositeIds(viewContainerLocation) {
            return this.getSelectorPartByLocation(viewContainerLocation).getPinnedPaneCompositeIds();
        }
        getVisiblePaneCompositeIds(viewContainerLocation) {
            return this.getSelectorPartByLocation(viewContainerLocation).getVisiblePaneCompositeIds();
        }
        getProgressIndicator(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getProgressIndicator(id);
        }
        hideActivePaneComposite(viewContainerLocation) {
            this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
        }
        getLastActivePaneCompositeId(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getLastActivePaneCompositeId();
        }
        showActivity(id, viewContainerLocation, badge, clazz, priority) {
            return this.getSelectorPartByLocation(viewContainerLocation).showActivity(id, badge, clazz, priority);
        }
        getPartByLocation(viewContainerLocation) {
            return (0, types_1.assertIsDefined)(this.paneCompositeParts.get(viewContainerLocation));
        }
        getSelectorPartByLocation(viewContainerLocation) {
            return (0, types_1.assertIsDefined)(this.paneCompositeSelectorParts.get(viewContainerLocation));
        }
    };
    exports.PaneCompositeParts = PaneCompositeParts;
    exports.PaneCompositeParts = PaneCompositeParts = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], PaneCompositeParts);
    (0, extensions_1.registerSingleton)(panecomposite_1.IPaneCompositePartService, PaneCompositeParts, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZUNvbXBvc2l0ZVBhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9wYW5lQ29tcG9zaXRlUGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE4RXpGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVU7UUFVakQsWUFBbUMsb0JBQTJDO1lBQzdFLEtBQUssRUFBRSxDQUFDO1lBSlEsdUJBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7WUFDMUUsK0JBQTBCLEdBQUcsSUFBSSxHQUFHLEVBQXFELENBQUM7WUFLMUcsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHFCQUFTLENBQUMsQ0FBQztZQUNqRSxNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQVcsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG1DQUFnQixDQUFDLENBQUM7WUFDL0UsTUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlDQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFMUYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsc0NBQThCLFNBQVMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLHdDQUFnQyxXQUFXLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyw2Q0FBcUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVsRixJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxzQ0FBOEIsU0FBUyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsd0NBQWdDLGVBQWUsQ0FBQyxDQUFDO1lBQ3BGLElB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