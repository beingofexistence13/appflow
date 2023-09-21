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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/layout/browser/layoutService", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/quickinput/browser/quickAccess", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/quickinput/browser/quickInputController"], function (require, exports, cancellation_1, event_1, contextkey_1, instantiation_1, layoutService_1, listService_1, opener_1, quickAccess_1, defaultStyles_1, colorRegistry_1, themeService_1, quickInputController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IAb = void 0;
    let $IAb = class $IAb extends themeService_1.$nv {
        get backButton() { return this.f.backButton; }
        get f() {
            if (!this.c) {
                this.c = this.B(this.u());
            }
            return this.c;
        }
        get g() { return !!this.c; }
        get quickAccess() {
            if (!this.j) {
                this.j = this.B(this.r.createInstance(quickAccess_1.$HAb));
            }
            return this.j;
        }
        constructor(r, s, themeService, t) {
            super(themeService);
            this.r = r;
            this.s = s;
            this.t = t;
            this.a = this.B(new event_1.$fd());
            this.onShow = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onHide = this.b.event;
            this.m = new Map();
        }
        u(host = this.t, options) {
            const defaultOptions = {
                idPrefix: 'quickInput_',
                container: host.container,
                ignoreFocusOut: () => false,
                backKeybindingLabel: () => undefined,
                setContextKey: (id) => this.y(id),
                linkOpenerDelegate: (content) => {
                    // HACK: https://github.com/microsoft/vscode/issues/173691
                    this.r.invokeFunction(accessor => {
                        const openerService = accessor.get(opener_1.$NT);
                        openerService.open(content, { allowCommands: true, fromUserGesture: true });
                    });
                },
                returnFocus: () => host.focus(),
                createList: (user, container, delegate, renderers, options) => this.r.createInstance(listService_1.$p4, user, container, delegate, renderers, options),
                styles: this.D()
            };
            const controller = this.B(new quickInputController_1.$GAb({
                ...defaultOptions,
                ...options
            }, this.n));
            controller.layout(host.dimension, host.offset.quickPickTop);
            // Layout changes
            this.B(host.onDidLayout(dimension => controller.layout(dimension, host.offset.quickPickTop)));
            // Context keys
            this.B(controller.onShow(() => {
                this.C();
                this.a.fire();
            }));
            this.B(controller.onHide(() => {
                this.C();
                this.b.fire();
            }));
            return controller;
        }
        y(id) {
            let key;
            if (id) {
                key = this.m.get(id);
                if (!key) {
                    key = new contextkey_1.$2i(id, false)
                        .bindTo(this.s);
                    this.m.set(id, key);
                }
            }
            if (key && key.get()) {
                return; // already active context
            }
            this.C();
            key?.set(true);
        }
        C() {
            this.m.forEach(context => {
                if (context.get()) {
                    context.reset();
                }
            });
        }
        pick(picks, options = {}, token = cancellation_1.CancellationToken.None) {
            return this.f.pick(picks, options, token);
        }
        input(options = {}, token = cancellation_1.CancellationToken.None) {
            return this.f.input(options, token);
        }
        createQuickPick() {
            return this.f.createQuickPick();
        }
        createInputBox() {
            return this.f.createInputBox();
        }
        createQuickWidget() {
            return this.f.createQuickWidget();
        }
        focus() {
            this.f.focus();
        }
        toggle() {
            this.f.toggle();
        }
        navigate(next, quickNavigate) {
            this.f.navigate(next, quickNavigate);
        }
        accept(keyMods) {
            return this.f.accept(keyMods);
        }
        back() {
            return this.f.back();
        }
        cancel() {
            return this.f.cancel();
        }
        updateStyles() {
            if (this.g) {
                this.f.applyStyles(this.D());
            }
        }
        D() {
            return {
                widget: {
                    quickInputBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ew),
                    quickInputForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Fw),
                    quickInputTitleBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Gw),
                    widgetBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Lv),
                    widgetShadow: (0, colorRegistry_1.$pv)(colorRegistry_1.$Kv),
                },
                inputBox: defaultStyles_1.$s2,
                toggle: defaultStyles_1.$m2,
                countBadge: defaultStyles_1.$v2,
                button: defaultStyles_1.$i2,
                progressBar: defaultStyles_1.$k2,
                keybindingLabel: defaultStyles_1.$g2,
                list: (0, defaultStyles_1.$A2)({
                    listBackground: colorRegistry_1.$Ew,
                    listFocusBackground: colorRegistry_1.$8x,
                    listFocusForeground: colorRegistry_1.$6x,
                    // Look like focused when inactive.
                    listInactiveFocusForeground: colorRegistry_1.$6x,
                    listInactiveSelectionIconForeground: colorRegistry_1.$7x,
                    listInactiveFocusBackground: colorRegistry_1.$8x,
                    listFocusOutline: colorRegistry_1.$Bv,
                    listInactiveFocusOutline: colorRegistry_1.$Bv,
                }),
                pickerGroup: {
                    pickerGroupBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Iw),
                    pickerGroupForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Hw),
                }
            };
        }
    };
    exports.$IAb = $IAb;
    exports.$IAb = $IAb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, contextkey_1.$3i),
        __param(2, themeService_1.$gv),
        __param(3, layoutService_1.$XT)
    ], $IAb);
});
//# sourceMappingURL=quickInputService.js.map