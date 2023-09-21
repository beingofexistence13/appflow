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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/lifecycle", "vs/nls!vs/editor/contrib/suggest/browser/suggestWidgetStatus", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, dom, actionbar_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, actions_1, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t6 = void 0;
    class StatusBarViewItem extends menuEntryActionViewItem_1.$C3 {
        w() {
            const kb = this.S.lookupKeybinding(this._action.id, this.W);
            if (!kb) {
                return super.w();
            }
            if (this.H) {
                this.H.textContent = (0, nls_1.localize)(0, null, this._action.label, StatusBarViewItem.symbolPrintEnter(kb));
            }
        }
        static symbolPrintEnter(kb) {
            return kb.getLabel()?.replace(/\benter\b/gi, '\u23CE');
        }
    }
    let $t6 = class $t6 {
        constructor(container, d, instantiationService, e, f) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.c = new lifecycle_1.$jc();
            this.element = dom.$0O(container, dom.$('.suggest-status-bar'));
            const actionViewItemProvider = (action => {
                return action instanceof actions_1.$Vu ? instantiationService.createInstance(StatusBarViewItem, action, undefined) : undefined;
            });
            this.a = new actionbar_1.$1P(this.element, { actionViewItemProvider });
            this.b = new actionbar_1.$1P(this.element, { actionViewItemProvider });
            this.a.domNode.classList.add('left');
            this.b.domNode.classList.add('right');
        }
        dispose() {
            this.c.dispose();
            this.a.dispose();
            this.b.dispose();
            this.element.remove();
        }
        show() {
            const menu = this.e.createMenu(this.d, this.f);
            const renderMenu = () => {
                const left = [];
                const right = [];
                for (const [group, actions] of menu.getActions()) {
                    if (group === 'left') {
                        left.push(...actions);
                    }
                    else {
                        right.push(...actions);
                    }
                }
                this.a.clear();
                this.a.push(left);
                this.b.clear();
                this.b.push(right);
            };
            this.c.add(menu.onDidChange(() => renderMenu()));
            this.c.add(menu);
        }
        hide() {
            this.c.clear();
        }
    };
    exports.$t6 = $t6;
    exports.$t6 = $t6 = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, actions_1.$Su),
        __param(4, contextkey_1.$3i)
    ], $t6);
});
//# sourceMappingURL=suggestWidgetStatus.js.map