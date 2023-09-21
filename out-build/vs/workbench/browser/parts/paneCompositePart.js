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
    exports.$$xb = void 0;
    let $$xb = class $$xb extends lifecycle_1.$kc {
        constructor(instantiationService) {
            super();
            this.a = new Map();
            this.b = new Map();
            const panelPart = instantiationService.createInstance(panelPart_1.$7xb);
            const sideBarPart = instantiationService.createInstance(sidebarPart_1.$0xb);
            const auxiliaryBarPart = instantiationService.createInstance(auxiliaryBarPart_1.$8xb);
            const activityBarPart = instantiationService.createInstance(activitybarPart_1.$4xb, sideBarPart);
            this.a.set(1 /* ViewContainerLocation.Panel */, panelPart);
            this.a.set(0 /* ViewContainerLocation.Sidebar */, sideBarPart);
            this.a.set(2 /* ViewContainerLocation.AuxiliaryBar */, auxiliaryBarPart);
            this.b.set(1 /* ViewContainerLocation.Panel */, panelPart);
            this.b.set(0 /* ViewContainerLocation.Sidebar */, activityBarPart);
            this.b.set(2 /* ViewContainerLocation.AuxiliaryBar */, auxiliaryBarPart);
            const eventDisposables = this.B(new lifecycle_1.$jc());
            this.onDidPaneCompositeOpen = event_1.Event.any(...views_1.$9E.map(loc => event_1.Event.map(this.a.get(loc).onDidPaneCompositeOpen, composite => { return { composite, viewContainerLocation: loc }; }, eventDisposables)));
            this.onDidPaneCompositeClose = event_1.Event.any(...views_1.$9E.map(loc => event_1.Event.map(this.a.get(loc).onDidPaneCompositeClose, composite => { return { composite, viewContainerLocation: loc }; }, eventDisposables)));
        }
        openPaneComposite(id, viewContainerLocation, focus) {
            return this.c(viewContainerLocation).openPaneComposite(id, focus);
        }
        getActivePaneComposite(viewContainerLocation) {
            return this.c(viewContainerLocation).getActivePaneComposite();
        }
        getPaneComposite(id, viewContainerLocation) {
            return this.c(viewContainerLocation).getPaneComposite(id);
        }
        getPaneComposites(viewContainerLocation) {
            return this.c(viewContainerLocation).getPaneComposites();
        }
        getPinnedPaneCompositeIds(viewContainerLocation) {
            return this.f(viewContainerLocation).getPinnedPaneCompositeIds();
        }
        getVisiblePaneCompositeIds(viewContainerLocation) {
            return this.f(viewContainerLocation).getVisiblePaneCompositeIds();
        }
        getProgressIndicator(id, viewContainerLocation) {
            return this.c(viewContainerLocation).getProgressIndicator(id);
        }
        hideActivePaneComposite(viewContainerLocation) {
            this.c(viewContainerLocation).hideActivePaneComposite();
        }
        getLastActivePaneCompositeId(viewContainerLocation) {
            return this.c(viewContainerLocation).getLastActivePaneCompositeId();
        }
        showActivity(id, viewContainerLocation, badge, clazz, priority) {
            return this.f(viewContainerLocation).showActivity(id, badge, clazz, priority);
        }
        c(viewContainerLocation) {
            return (0, types_1.$uf)(this.a.get(viewContainerLocation));
        }
        f(viewContainerLocation) {
            return (0, types_1.$uf)(this.b.get(viewContainerLocation));
        }
    };
    exports.$$xb = $$xb;
    exports.$$xb = $$xb = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $$xb);
    (0, extensions_1.$mr)(panecomposite_1.$Yeb, $$xb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=paneCompositePart.js.map