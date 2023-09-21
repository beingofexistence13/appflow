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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "./contextMenuHandler", "./contextView"], function (require, exports, dom_1, actions_1, event_1, lifecycle_1, menuEntryActionViewItem_1, actions_2, contextkey_1, keybinding_1, notification_1, telemetry_1, contextMenuHandler_1, contextView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextMenuMenuDelegate = exports.$B4b = void 0;
    let $B4b = class $B4b extends lifecycle_1.$kc {
        get b() {
            if (!this.a) {
                this.a = new contextMenuHandler_1.$A4b(this.j, this.g, this.h, this.m);
            }
            return this.a;
        }
        constructor(g, h, j, m, n, s) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.s = s;
            this.a = undefined;
            this.c = this.q.add(new event_1.$fd());
            this.onDidShowContextMenu = this.c.event;
            this.f = this.q.add(new event_1.$fd());
            this.onDidHideContextMenu = this.f.event;
        }
        configure(options) {
            this.b.configure(options);
        }
        // ContextMenu
        showContextMenu(delegate) {
            delegate = ContextMenuMenuDelegate.transform(delegate, this.n, this.s);
            this.b.showContextMenu({
                ...delegate,
                onHide: (didCancel) => {
                    delegate.onHide?.(didCancel);
                    this.f.fire();
                }
            });
            dom_1.$xP.getInstance().resetKeyStatus();
            this.c.fire();
        }
    };
    exports.$B4b = $B4b;
    exports.$B4b = $B4b = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, notification_1.$Yu),
        __param(2, contextView_1.$VZ),
        __param(3, keybinding_1.$2D),
        __param(4, actions_2.$Su),
        __param(5, contextkey_1.$3i)
    ], $B4b);
    var ContextMenuMenuDelegate;
    (function (ContextMenuMenuDelegate) {
        function is(thing) {
            return thing && thing.menuId instanceof actions_2.$Ru;
        }
        function transform(delegate, menuService, globalContextKeyService) {
            if (!is(delegate)) {
                return delegate;
            }
            const { menuId, menuActionOptions, contextKeyService } = delegate;
            return {
                ...delegate,
                getActions: () => {
                    const target = [];
                    if (menuId) {
                        const menu = menuService.createMenu(menuId, contextKeyService ?? globalContextKeyService);
                        (0, menuEntryActionViewItem_1.$A3)(menu, menuActionOptions, target);
                        menu.dispose();
                    }
                    if (!delegate.getActions) {
                        return target;
                    }
                    else {
                        return actions_1.$ii.join(delegate.getActions(), target);
                    }
                }
            };
        }
        ContextMenuMenuDelegate.transform = transform;
    })(ContextMenuMenuDelegate || (exports.ContextMenuMenuDelegate = ContextMenuMenuDelegate = {}));
});
//# sourceMappingURL=contextMenuService.js.map