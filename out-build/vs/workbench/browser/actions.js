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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, lifecycle_1, event_1, actions_1, contextkey_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qeb = void 0;
    class MenuActions extends lifecycle_1.$kc {
        get primaryActions() { return this.b; }
        get secondaryActions() { return this.c; }
        constructor(menuId, h, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = [];
            this.c = [];
            this.f = this.B(new event_1.$fd());
            this.onDidChange = this.f.event;
            this.g = this.B(new lifecycle_1.$jc());
            this.a = this.B(j.createMenu(menuId, m));
            this.B(this.a.onDidChange(() => this.n()));
            this.n();
        }
        n() {
            this.g.clear();
            this.b = [];
            this.c = [];
            (0, menuEntryActionViewItem_1.$B3)(this.a, this.h, { primary: this.b, secondary: this.c });
            this.g.add(this.r([...this.b, ...this.c], {}));
            this.f.fire();
        }
        r(actions, submenus) {
            const disposables = new lifecycle_1.$jc();
            for (const action of actions) {
                if (action instanceof actions_1.$Uu && !submenus[action.item.submenu.id]) {
                    const menu = submenus[action.item.submenu.id] = disposables.add(this.j.createMenu(action.item.submenu, this.m));
                    disposables.add(menu.onDidChange(() => this.n()));
                    disposables.add(this.r(action.actions, submenus));
                }
            }
            return disposables;
        }
    }
    let $qeb = class $qeb extends lifecycle_1.$kc {
        constructor(menuId, g, h, j, m) {
            super();
            this.menuId = menuId;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.f = this.B(new event_1.$fd());
            this.onDidChange = this.f.event;
            this.c = this.B(new MenuActions(menuId, this.h, m, j));
            this.B(this.c.onDidChange(() => this.f.fire()));
        }
        getPrimaryActions() {
            return this.c.primaryActions;
        }
        getSecondaryActions() {
            return this.c.secondaryActions;
        }
        getContextMenuActions() {
            const actions = [];
            if (this.g) {
                const menu = this.m.createMenu(this.g, this.j);
                (0, menuEntryActionViewItem_1.$B3)(menu, this.h, { primary: [], secondary: actions });
                menu.dispose();
            }
            return actions;
        }
    };
    exports.$qeb = $qeb;
    exports.$qeb = $qeb = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, actions_1.$Su)
    ], $qeb);
});
//# sourceMappingURL=actions.js.map