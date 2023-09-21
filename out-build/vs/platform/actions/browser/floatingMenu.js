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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry"], function (require, exports, dom_1, widget_1, event_1, lifecycle_1, menuEntryActionViewItem_1, actions_1, contextkey_1, instantiation_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$prb = exports.$orb = exports.$nrb = void 0;
    class $nrb extends widget_1.$IP {
        constructor(c) {
            super();
            this.c = c;
            this.a = this.B(new event_1.$fd());
            this.onClick = this.a.event;
            this.b = (0, dom_1.$)('.floating-click-widget');
            this.b.style.padding = '6px 11px';
            this.b.style.borderRadius = '2px';
            this.b.style.cursor = 'pointer';
            this.b.style.zIndex = '1';
        }
        getDomNode() {
            return this.b;
        }
        render() {
            (0, dom_1.$lO)(this.b);
            this.b.style.backgroundColor = (0, colorRegistry_1.$qv)(colorRegistry_1.$0v, (0, colorRegistry_1.$pv)(colorRegistry_1.$ww));
            this.b.style.color = (0, colorRegistry_1.$qv)(colorRegistry_1.$8v, (0, colorRegistry_1.$pv)(colorRegistry_1.$xw));
            this.b.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$Av)}`;
            (0, dom_1.$0O)(this.b, (0, dom_1.$)('')).textContent = this.c;
            this.f(this.b, () => this.a.fire());
        }
    }
    exports.$nrb = $nrb;
    let $orb = class $orb extends lifecycle_1.$kc {
        constructor(menuId, menuService, contextKeyService) {
            super();
            this.a = new event_1.$fd();
            this.b = this.a.event;
            this.c = this.B(menuService.createMenu(menuId, contextKeyService));
        }
        /** Should be called in implementation constructors after they initialized */
        f() {
            const menuDisposables = this.B(new lifecycle_1.$jc());
            const renderMenuAsFloatingClickBtn = () => {
                menuDisposables.clear();
                if (!this.j()) {
                    return;
                }
                const actions = [];
                (0, menuEntryActionViewItem_1.$B3)(this.c, { renderShortTitle: true, shouldForwardArgs: true }, actions);
                if (actions.length === 0) {
                    return;
                }
                // todo@jrieken find a way to handle N actions, like showing a context menu
                const [first] = actions;
                const widget = this.g(first, menuDisposables);
                menuDisposables.add(widget);
                menuDisposables.add(widget.onClick(() => first.run(this.h())));
                widget.render();
            };
            this.B(this.c.onDidChange(renderMenuAsFloatingClickBtn));
            renderMenuAsFloatingClickBtn();
        }
        h() {
            return undefined;
        }
        j() {
            return true;
        }
    };
    exports.$orb = $orb;
    exports.$orb = $orb = __decorate([
        __param(1, actions_1.$Su),
        __param(2, contextkey_1.$3i)
    ], $orb);
    let $prb = class $prb extends $orb {
        constructor(m, n, menuService, contextKeyService) {
            super(m.menuId, menuService, contextKeyService);
            this.m = m;
            this.n = n;
            this.f();
        }
        g(action, disposable) {
            const w = this.n.createInstance($nrb, action.label);
            const node = w.getDomNode();
            this.m.container.appendChild(node);
            disposable.add((0, lifecycle_1.$ic)(() => this.m.container.removeChild(node)));
            return w;
        }
        h() {
            return this.m.getActionArg();
        }
    };
    exports.$prb = $prb;
    exports.$prb = $prb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, actions_1.$Su),
        __param(3, contextkey_1.$3i)
    ], $prb);
});
//# sourceMappingURL=floatingMenu.js.map