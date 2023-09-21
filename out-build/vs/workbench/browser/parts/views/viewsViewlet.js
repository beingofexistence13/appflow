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
define(["require", "exports", "vs/workbench/services/extensions/common/extensions", "vs/platform/contextview/browser/contextView", "vs/workbench/common/views", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService"], function (require, exports, extensions_1, contextView_1, views_1, telemetry_1, themeService_1, instantiation_1, storage_1, workspace_1, viewPaneContainer_1, configuration_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Qeb = void 0;
    let $Qeb = class $Qeb extends viewPaneContainer_1.$Seb {
        constructor(viewletId, onDidChangeFilterValue, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService) {
            super(viewletId, { mergeViewWithContainerWhenSingleView: false }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.r = new Map();
            this.t = new Map();
            this.B(onDidChangeFilterValue(newFilterValue => {
                this.yb = newFilterValue;
                this.Db(newFilterValue);
            }));
            this.B(this.onDidChangeViewVisibility(view => {
                const descriptorMap = Array.from(this.t.entries()).find(entry => entry[1].has(view.id));
                if (descriptorMap && !this.yb?.includes(descriptorMap[0])) {
                    this.Cb(descriptorMap[1].get(view.id));
                }
            }));
            this.B(this.M.onDidChangeActiveViewDescriptors(() => {
                this.zb(this.M.activeViewDescriptors);
            }));
        }
        zb(viewDescriptors) {
            viewDescriptors.forEach(descriptor => {
                const filterOnValue = this.Bb(descriptor);
                if (!filterOnValue) {
                    return;
                }
                if (!this.t.has(filterOnValue)) {
                    this.t.set(filterOnValue, new Map());
                }
                this.t.get(filterOnValue).set(descriptor.id, descriptor);
                if (this.yb && !this.yb.includes(filterOnValue) && this.panes.find(pane => pane.id === descriptor.id)) {
                    this.M.setVisible(descriptor.id, false);
                }
            });
        }
        Ab(constantViewDescriptors) {
            constantViewDescriptors.forEach(viewDescriptor => this.r.set(viewDescriptor.id, viewDescriptor));
        }
        Db(newFilterValue) {
            if (this.t.size === 0) {
                this.zb(this.M.activeViewDescriptors);
            }
            this.Fb(newFilterValue).forEach(item => this.M.setVisible(item.id, false));
            this.Eb(newFilterValue).forEach(item => this.M.setVisible(item.id, true));
        }
        Eb(target) {
            const views = [];
            for (let i = 0; i < target.length; i++) {
                if (this.t.has(target[i])) {
                    views.push(...Array.from(this.t.get(target[i]).values()));
                }
            }
            return views;
        }
        Fb(target) {
            const iterable = this.t.keys();
            let key = iterable.next();
            let views = [];
            while (!key.done) {
                let isForTarget = false;
                target.forEach(value => {
                    if (key.value === value) {
                        isForTarget = true;
                    }
                });
                if (!isForTarget) {
                    views = views.concat(this.Eb([key.value]));
                }
                key = iterable.next();
            }
            return views;
        }
        rb(added) {
            const panes = super.rb(added);
            for (let i = 0; i < added.length; i++) {
                if (this.r.has(added[i].viewDescriptor.id)) {
                    panes[i].setExpanded(false);
                }
            }
            // Check that allViews is ready
            if (this.t.size === 0) {
                this.zb(this.M.activeViewDescriptors);
            }
            return panes;
        }
    };
    exports.$Qeb = $Qeb;
    exports.$Qeb = $Qeb = __decorate([
        __param(2, configuration_1.$8h),
        __param(3, layoutService_1.$Meb),
        __param(4, telemetry_1.$9k),
        __param(5, storage_1.$Vo),
        __param(6, instantiation_1.$Ah),
        __param(7, themeService_1.$gv),
        __param(8, contextView_1.$WZ),
        __param(9, extensions_1.$MF),
        __param(10, workspace_1.$Kh),
        __param(11, views_1.$_E)
    ], $Qeb);
});
//# sourceMappingURL=viewsViewlet.js.map