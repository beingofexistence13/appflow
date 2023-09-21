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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/async", "vs/base/common/event", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll", "vs/platform/actions/browser/toolbar"], function (require, exports, DOM, toolbar_1, async_1, event_1, menuEntryActionViewItem_1, actions_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, cellActionView_1, cellPart_1, cellToolbarStickyScroll_1, toolbar_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ppb = exports.$opb = void 0;
    let $opb = class $opb extends cellPart_1.$Inb {
        constructor(f, _titleToolbarContainer, h, j, m, n, r) {
            super();
            this.f = f;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
        }
        s() {
            if (this.c) {
                return this.c;
            }
            const betweenCellToolbar = this.B(new toolbar_1.$6R(this.h, this.m, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.$Vu) {
                        if (this.f.notebookOptions.getLayoutConfiguration().insertToolbarAlignment === 'center') {
                            return this.j.createInstance(cellActionView_1.$lpb, action, undefined);
                        }
                        else {
                            return this.j.createInstance(menuEntryActionViewItem_1.$C3, action, undefined);
                        }
                    }
                    return undefined;
                }
            }));
            this.c = betweenCellToolbar;
            const menu = this.B(this.r.createMenu(this.f.creationOptions.menuIds.cellInsertToolbar, this.n));
            const updateActions = () => {
                const actions = getCellToolbarActions(menu);
                betweenCellToolbar.setActions(actions.primary, actions.secondary);
            };
            this.B(menu.onDidChange(() => updateActions()));
            this.B(this.f.notebookOptions.onDidChangeOptions((e) => {
                if (e.insertToolbarAlignment) {
                    updateActions();
                }
            }));
            updateActions();
            return betweenCellToolbar;
        }
        didRenderCell(element) {
            const betweenCellToolbar = this.s();
            betweenCellToolbar.context = {
                ui: true,
                cell: element,
                notebookEditor: this.f,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
            this.updateInternalLayoutNow(element);
        }
        updateInternalLayoutNow(element) {
            const bottomToolbarOffset = element.layoutInfo.bottomToolbarOffset;
            this.h.style.transform = `translateY(${bottomToolbarOffset}px)`;
        }
    };
    exports.$opb = $opb;
    exports.$opb = $opb = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, contextView_1.$WZ),
        __param(5, contextkey_1.$3i),
        __param(6, actions_1.$Su)
    ], $opb);
    let $ppb = class $ppb extends cellPart_1.$Inb {
        get hasActions() {
            if (!this.c) {
                return false;
            }
            return this.c.actions.primary.length
                + this.c.actions.secondary.length
                + this.c.deleteActions.primary.length
                + this.c.deleteActions.secondary.length
                > 0;
        }
        constructor(j, m, n, r, s, t, u, w) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.h = this.B(new event_1.$fd());
            this.onDidUpdateActions = this.h.event;
        }
        y() {
            if (this.c) {
                return this.c;
            }
            const titleMenu = this.B(this.u.createMenu(this.n, this.t));
            const deleteMenu = this.B(this.u.createMenu(this.r, this.t));
            const actions = getCellToolbarActions(titleMenu);
            const deleteActions = getCellToolbarActions(deleteMenu);
            this.c = {
                titleMenu,
                actions,
                deleteMenu,
                deleteActions
            };
            return this.c;
        }
        z(model, element) {
            if (this.f) {
                return this.f;
            }
            const toolbar = this.B(this.w.createInstance(toolbar_2.$L6, this.j, {
                actionViewItemProvider: action => {
                    return (0, menuEntryActionViewItem_1.$F3)(this.w, action);
                },
                renderDropdownAsChildElement: true
            }));
            const deleteToolbar = this.B(this.w.invokeFunction(accessor => createDeleteToolbar(accessor, this.j, 'cell-delete-toolbar')));
            if (model.deleteActions.primary.length !== 0 || model.deleteActions.secondary.length !== 0) {
                deleteToolbar.setActions(model.deleteActions.primary, model.deleteActions.secondary);
            }
            this.D(toolbar, model.titleMenu, model.actions);
            this.D(deleteToolbar, model.deleteMenu, model.deleteActions);
            this.f = {
                toolbar,
                deleteToolbar
            };
            return this.f;
        }
        prepareRenderCell(element) {
            this.y();
        }
        didRenderCell(element) {
            const model = this.y();
            const view = this.z(model, element);
            this.b.add((0, cellToolbarStickyScroll_1.$npb)(this.s, element, this.j, { extraOffset: 4, min: -14 }));
            this.C(view, {
                ui: true,
                cell: element,
                notebookEditor: this.s,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            });
        }
        C(view, toolbarContext) {
            view.toolbar.context = toolbarContext;
            view.deleteToolbar.context = toolbarContext;
        }
        D(toolbar, menu, initActions) {
            // #103926
            let dropdownIsVisible = false;
            let deferredUpdate;
            this.F(toolbar, initActions);
            this.B(menu.onDidChange(() => {
                if (dropdownIsVisible) {
                    const actions = getCellToolbarActions(menu);
                    deferredUpdate = () => this.F(toolbar, actions);
                    return;
                }
                const actions = getCellToolbarActions(menu);
                this.F(toolbar, actions);
            }));
            this.m.toggle('cell-toolbar-dropdown-active', false);
            this.B(toolbar.onDidChangeDropdownVisibility(visible => {
                dropdownIsVisible = visible;
                this.m.toggle('cell-toolbar-dropdown-active', visible);
                if (deferredUpdate && !visible) {
                    this.B((0, async_1.$Ig)(() => {
                        deferredUpdate?.();
                    }));
                    deferredUpdate = undefined;
                }
            }));
        }
        F(toolbar, actions) {
            const hadFocus = DOM.$NO(document.activeElement, toolbar.getElement());
            toolbar.setActions(actions.primary, actions.secondary);
            if (hadFocus) {
                this.s.focus();
            }
            if (actions.primary.length || actions.secondary.length) {
                this.m.toggle('cell-has-toolbar-actions', true);
                this.h.fire();
            }
            else {
                this.m.toggle('cell-has-toolbar-actions', false);
                this.h.fire();
            }
        }
    };
    exports.$ppb = $ppb;
    exports.$ppb = $ppb = __decorate([
        __param(5, contextkey_1.$3i),
        __param(6, actions_1.$Su),
        __param(7, instantiation_1.$Ah)
    ], $ppb);
    function getCellToolbarActions(menu) {
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
        return result;
    }
    function createDeleteToolbar(accessor, container, elementClass) {
        const contextMenuService = accessor.get(contextView_1.$WZ);
        const keybindingService = accessor.get(keybinding_1.$2D);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const toolbar = new toolbar_1.$6R(container, contextMenuService, {
            getKeyBinding: action => keybindingService.lookupKeybinding(action.id),
            actionViewItemProvider: action => {
                return (0, menuEntryActionViewItem_1.$F3)(instantiationService, action);
            },
            renderDropdownAsChildElement: true
        });
        if (elementClass) {
            toolbar.getElement().classList.add(elementClass);
        }
        return toolbar;
    }
});
//# sourceMappingURL=cellToolbars.js.map