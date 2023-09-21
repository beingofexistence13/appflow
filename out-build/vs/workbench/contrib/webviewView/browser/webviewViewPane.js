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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/views", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webviewView/browser/webviewViewService", "vs/workbench/services/activity/common/activity", "vs/workbench/services/extensions/common/extensions"], function (require, exports, dom_1, cancellation_1, event_1, lifecycle_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, opener_1, progress_1, storage_1, telemetry_1, themeService_1, viewPane_1, memento_1, views_1, webview_1, webviewWindowDragMonitor_1, webviewViewService_1, activity_1, extensions_1) {
    "use strict";
    var $zvb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zvb = void 0;
    const storageKeys = {
        webviewState: 'webviewState',
    };
    let $zvb = class $zvb extends viewPane_1.$Ieb {
        static { $zvb_1 = this; }
        static b(storageService) {
            this.a ??= new webview_1.$Obb('webviewViews.origins', storageService);
            return this.a;
        }
        constructor(options, configurationService, contextKeyService, contextMenuService, instantiationService, keybindingService, openerService, telemetryService, themeService, viewDescriptorService, Xb, Yb, Zb, $b, ac, bc, cc) {
            super({ ...options, titleMenuId: actions_1.$Ru.ViewTitle, showActions: viewPane_1.ViewPaneShowActions.WhenExpanded }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.c = this.B(new lifecycle_1.$lc());
            this.f = this.B(new lifecycle_1.$jc());
            this.g = false;
            this.dc = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.dc.event;
            this.ec = this.B(new event_1.$fd());
            this.onDispose = this.ec.event;
            this.sb = options.fromExtensionId;
            this.n = this.title;
            this.L = new memento_1.$YT(`webviewView.${this.id}`, $b);
            this.ab = this.L.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.B(this.onDidChangeBodyVisibility(() => this.hc()));
            this.B(this.cc.onNewResolverRegistered(e => {
                if (e.viewType === this.id) {
                    // Potentially re-activate if we have a new resolver
                    this.hc();
                }
            }));
            this.hc();
        }
        dispose() {
            this.ec.fire();
            clearTimeout(this.Wb);
            super.dispose();
        }
        focus() {
            super.focus();
            this.c.value?.focus();
        }
        U(container) {
            super.U(container);
            this.h = container;
            this.j = undefined;
            if (!this.m) {
                this.m = new ResizeObserver(() => {
                    setTimeout(() => {
                        this.nc();
                    }, 0);
                });
                this.B((0, lifecycle_1.$ic)(() => {
                    this.m.disconnect();
                }));
                this.m.observe(container);
            }
        }
        saveState() {
            if (this.c.value) {
                this.ab[storageKeys.webviewState] = this.c.value.state;
            }
            this.L.saveMemento();
            super.saveState();
        }
        W(height, width) {
            super.W(height, width);
            this.nc(new dom_1.$BO(width, height));
        }
        hc() {
            if (this.isBodyVisible()) {
                this.ic();
                this.c.value?.claim(this, undefined);
            }
            else {
                this.c.value?.release(this);
            }
        }
        ic() {
            if (this.g) {
                return;
            }
            this.g = true;
            const origin = this.sb ? $zvb_1.b(this.$b).getOrigin(this.id, this.sb) : undefined;
            const webview = this.bc.createWebviewOverlay({
                origin,
                providedViewType: this.id,
                title: this.title,
                options: { purpose: "webviewView" /* WebviewContentPurpose.WebviewView */ },
                contentOptions: {},
                extension: this.sb ? { id: this.sb } : undefined
            });
            webview.state = this.ab[storageKeys.webviewState];
            this.c.value = webview;
            if (this.h) {
                this.nc();
            }
            this.f.add((0, lifecycle_1.$ic)(() => {
                this.c.value?.release(this);
            }));
            this.f.add(webview.onDidUpdateState(() => {
                this.ab[storageKeys.webviewState] = webview.state;
            }));
            // Re-dispatch all drag events back to the drop target to support view drag drop
            for (const event of [dom_1.$3O.DRAG, dom_1.$3O.DRAG_END, dom_1.$3O.DRAG_ENTER, dom_1.$3O.DRAG_LEAVE, dom_1.$3O.DRAG_START]) {
                this.f.add((0, dom_1.$nO)(this.c.value.container, event, e => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this.dropTargetElement.dispatchEvent(new DragEvent(e.type, e));
                }));
            }
            this.f.add(new webviewWindowDragMonitor_1.$afb(() => this.c.value));
            const source = this.f.add(new cancellation_1.$pd());
            this.lc(async () => {
                await this.Yb.activateByEvent(`onView:${this.id}`);
                const self = this;
                const webviewView = {
                    webview,
                    onDidChangeVisibility: this.onDidChangeBodyVisibility,
                    onDispose: this.onDispose,
                    get title() { return self.r; },
                    set title(value) { self.Jb(value); },
                    get description() { return self.titleDescription; },
                    set description(value) { self.Lb(value); },
                    get badge() { return self.s; },
                    set badge(badge) { self.kc(badge); },
                    dispose: () => {
                        // Only reset and clear the webview itself. Don't dispose of the view container
                        this.g = false;
                        this.c.clear();
                        this.f.clear();
                    },
                    show: (preserveFocus) => {
                        this.ac.openView(this.id, !preserveFocus);
                    }
                };
                await this.cc.resolve(this.id, webviewView, source.token);
            });
        }
        Jb(value) {
            this.r = value;
            super.Jb(typeof value === 'string' ? value : this.n);
        }
        kc(badge) {
            if (this.s?.value === badge?.value &&
                this.s?.tooltip === badge?.tooltip) {
                return;
            }
            if (this.t) {
                this.t.dispose();
                this.t = undefined;
            }
            this.s = badge;
            if (badge) {
                const activity = {
                    badge: new activity_1.$IV(badge.value, () => badge.tooltip),
                    priority: 150
                };
                this.Xb.showViewActivity(this.id, activity);
            }
        }
        async lc(task) {
            return this.Zb.withProgress({ location: this.id, delay: 500 }, task);
        }
        onDidScrollRoot() {
            this.nc();
        }
        mc(dimension) {
            const webviewEntry = this.c.value;
            if (!this.h || !webviewEntry) {
                return;
            }
            if (!this.j || !this.j.isConnected) {
                this.j = this.oc(this.h);
            }
            webviewEntry.layoutWebviewOverElement(this.h, dimension, this.j);
        }
        nc(dimension) {
            this.mc(dimension);
            // Temporary fix for https://github.com/microsoft/vscode/issues/110450
            // There is an animation that lasts about 200ms, update the webview positioning once this animation is complete.
            clearTimeout(this.Wb);
            this.Wb = setTimeout(() => this.mc(dimension), 200);
        }
        oc(container) {
            return (0, dom_1.$QO)(container, 'monaco-scrollable-element') ?? undefined;
        }
    };
    exports.$zvb = $zvb;
    exports.$zvb = $zvb = $zvb_1 = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, contextkey_1.$3i),
        __param(3, contextView_1.$WZ),
        __param(4, instantiation_1.$Ah),
        __param(5, keybinding_1.$2D),
        __param(6, opener_1.$NT),
        __param(7, telemetry_1.$9k),
        __param(8, themeService_1.$gv),
        __param(9, views_1.$_E),
        __param(10, activity_1.$HV),
        __param(11, extensions_1.$MF),
        __param(12, progress_1.$2u),
        __param(13, storage_1.$Vo),
        __param(14, views_1.$$E),
        __param(15, webview_1.$Lbb),
        __param(16, webviewViewService_1.$vlb)
    ], $zvb);
});
//# sourceMappingURL=webviewViewPane.js.map