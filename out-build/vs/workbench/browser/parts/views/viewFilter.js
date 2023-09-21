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
define(["require", "exports", "vs/base/common/async", "vs/base/browser/dom", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry", "vs/nls!vs/workbench/browser/parts/views/viewFilter", "vs/platform/instantiation/common/instantiation", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/keybinding/common/keybinding", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/actions/common/actions", "vs/platform/actions/browser/toolbar", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/platform/theme/browser/defaultStyles"], function (require, exports, async_1, DOM, contextView_1, lifecycle_1, colorRegistry_1, nls_1, instantiation_1, contextScopedHistoryWidget_1, contextkey_1, codicons_1, keybinding_1, historyWidgetKeybindingHint_1, actions_1, toolbar_1, menuEntryActionViewItem_1, widget_1, event_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Geb = exports.$Feb = void 0;
    const viewFilterMenu = new actions_1.$Ru('menu.view.filter');
    exports.$Feb = new actions_1.$Ru('submenu.view.filter');
    actions_1.$Tu.appendMenuItem(viewFilterMenu, {
        submenu: exports.$Feb,
        title: (0, nls_1.localize)(0, null),
        group: 'navigation',
        icon: codicons_1.$Pj.filter,
    });
    class MoreFiltersActionViewItem extends menuEntryActionViewItem_1.$D3 {
        constructor() {
            super(...arguments);
            this.O = false;
        }
        set checked(checked) {
            if (this.O !== checked) {
                this.O = checked;
                this.G();
            }
        }
        G() {
            if (this.element) {
                this.element.classList.toggle('checked', this.O);
            }
        }
        render(container) {
            super.render(container);
            this.G();
        }
    }
    let $Geb = class $Geb extends widget_1.$IP {
        get onDidFocus() { return this.t.onDidFocus; }
        get onDidBlur() { return this.t.onDidBlur; }
        constructor(w, y, J, contextKeyService, L) {
            super();
            this.w = w;
            this.y = y;
            this.J = J;
            this.L = L;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeFilterText = this.n.event;
            this.s = false;
            this.a = new async_1.$Dg(400);
            this.B((0, lifecycle_1.$ic)(() => this.a.cancel()));
            if (w.focusContextKey) {
                this.h = new contextkey_1.$2i(w.focusContextKey, false).bindTo(contextKeyService);
            }
            this.element = DOM.$('.viewpane-filter');
            [this.b, this.t] = this.M(this.element);
            this.B(this.b);
            this.B(this.t);
            const controlsContainer = DOM.$0O(this.element, DOM.$('.viewpane-filter-controls'));
            this.c = this.N(controlsContainer);
            this.g = this.B(this.O(controlsContainer));
            this.Q();
        }
        hasFocus() {
            return this.b.hasFocus();
        }
        focus() {
            this.b.focus();
        }
        blur() {
            this.b.blur();
        }
        updateBadge(message) {
            this.c.classList.toggle('hidden', !message);
            this.c.textContent = message || '';
            this.Q();
        }
        setFilterText(filterText) {
            this.b.value = filterText;
        }
        getFilterText() {
            return this.b.value;
        }
        getHistory() {
            return this.b.getHistory();
        }
        layout(width) {
            this.element.parentElement?.classList.toggle('grow', width > 700);
            this.element.classList.toggle('small', width < 400);
            this.Q();
        }
        checkMoreFilters(checked) {
            this.s = checked;
            if (this.r) {
                this.r.checked = checked;
            }
        }
        M(container) {
            const inputBox = this.B(this.y.createInstance(contextScopedHistoryWidget_1.$S5, container, this.J, {
                placeholder: this.w.placeholder,
                ariaLabel: this.w.ariaLabel,
                history: this.w.history || [],
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.$L7)(this.L),
                inputBoxStyles: defaultStyles_1.$s2
            }));
            if (this.w.text) {
                inputBox.value = this.w.text;
            }
            this.B(inputBox.onDidChange(filter => this.a.trigger(() => this.P(inputBox))));
            this.B(DOM.$oO(inputBox.inputElement, DOM.$3O.KEY_DOWN, (e) => this.S(e, inputBox)));
            this.B(DOM.$oO(container, DOM.$3O.KEY_DOWN, this.R));
            this.B(DOM.$oO(container, DOM.$3O.KEY_UP, this.R));
            this.B(DOM.$oO(inputBox.inputElement, DOM.$3O.CLICK, (e) => {
                e.stopPropagation();
                e.preventDefault();
            }));
            const focusTracker = this.B(DOM.$8O(inputBox.inputElement));
            if (this.h) {
                this.B(focusTracker.onDidFocus(() => this.h.set(true)));
                this.B(focusTracker.onDidBlur(() => this.h.set(false)));
                this.B((0, lifecycle_1.$ic)(() => this.h.reset()));
            }
            return [inputBox, focusTracker];
        }
        N(container) {
            const filterBadge = DOM.$0O(container, DOM.$('.viewpane-filter-badge.hidden'));
            filterBadge.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$dw);
            filterBadge.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$ew);
            filterBadge.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$Av)}`;
            return filterBadge;
        }
        O(container) {
            return this.y.createInstance(toolbar_1.$M6, container, viewFilterMenu, {
                hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                actionViewItemProvider: (action) => {
                    if (action instanceof actions_1.$Uu && action.item.submenu.id === exports.$Feb.id) {
                        this.r = this.y.createInstance(MoreFiltersActionViewItem, action, undefined);
                        this.r.checked = this.s;
                        return this.r;
                    }
                    return undefined;
                }
            });
        }
        P(inputbox) {
            inputbox.addToHistory();
            this.n.fire(inputbox.value);
        }
        Q() {
            this.b.inputElement.style.paddingRight = this.element.classList.contains('small') || this.c.classList.contains('hidden') ? '25px' : '150px';
        }
        // Action toolbar is swallowing some keys for action items which should not be for an input box
        R(event) {
            if (event.equals(10 /* KeyCode.Space */)
                || event.equals(15 /* KeyCode.LeftArrow */)
                || event.equals(17 /* KeyCode.RightArrow */)) {
                event.stopPropagation();
            }
        }
        S(event, filterInputBox) {
            let handled = false;
            if (event.equals(2 /* KeyCode.Tab */) && !this.g.isEmpty()) {
                this.g.focus();
                handled = true;
            }
            if (handled) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };
    exports.$Geb = $Geb;
    exports.$Geb = $Geb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextView_1.$VZ),
        __param(3, contextkey_1.$3i),
        __param(4, keybinding_1.$2D)
    ], $Geb);
});
//# sourceMappingURL=viewFilter.js.map