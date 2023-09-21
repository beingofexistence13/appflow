var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/lifecycle", "vs/nls!vs/platform/actionWidget/browser/actionWidget", "vs/platform/actionWidget/browser/actionList", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/css!./actionWidget"], function (require, exports, dom, actionbar_1, lifecycle_1, nls_1, actionList_1, actions_1, contextkey_1, contextView_1, extensions_1, instantiation_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$N2 = void 0;
    (0, colorRegistry_1.$sv)('actionBar.toggledBackground', { dark: colorRegistry_1.$Rv, light: colorRegistry_1.$Rv, hcDark: colorRegistry_1.$Rv, hcLight: colorRegistry_1.$Rv, }, (0, nls_1.localize)(0, null));
    const ActionWidgetContextKeys = {
        Visible: new contextkey_1.$2i('codeActionMenuVisible', false, (0, nls_1.localize)(1, null))
    };
    exports.$N2 = (0, instantiation_1.$Bh)('actionWidgetService');
    let ActionWidgetService = class ActionWidgetService extends lifecycle_1.$kc {
        get isVisible() {
            return ActionWidgetContextKeys.Visible.getValue(this.c) || false;
        }
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = this.B(new lifecycle_1.$lc());
        }
        show(user, supportsPreview, items, delegate, anchor, container, actionBarActions) {
            const visibleContext = ActionWidgetContextKeys.Visible.bindTo(this.c);
            const list = this.f.createInstance(actionList_1.$H2, user, supportsPreview, items, delegate);
            this.b.showContextView({
                getAnchor: () => anchor,
                render: (container) => {
                    visibleContext.set(true);
                    return this.g(container, list, actionBarActions ?? []);
                },
                onHide: (didCancel) => {
                    visibleContext.reset();
                    this.j(didCancel);
                },
            }, container, false);
        }
        acceptSelected(preview) {
            this.a.value?.acceptSelected(preview);
        }
        focusPrevious() {
            this.a?.value?.focusPrevious();
        }
        focusNext() {
            this.a?.value?.focusNext();
        }
        hide() {
            this.a.value?.hide();
            this.a.clear();
        }
        clear() {
            this.a.clear();
        }
        g(element, list, actionBarActions) {
            const widget = document.createElement('div');
            widget.classList.add('action-widget');
            element.appendChild(widget);
            this.a.value = list;
            if (this.a.value) {
                widget.appendChild(this.a.value.domNode);
            }
            else {
                throw new Error('List has no value');
            }
            const renderDisposables = new lifecycle_1.$jc();
            // Invisible div to block mouse interaction in the rest of the UI
            const menuBlock = document.createElement('div');
            const block = element.appendChild(menuBlock);
            block.classList.add('context-view-block');
            renderDisposables.add(dom.$nO(block, dom.$3O.MOUSE_DOWN, e => e.stopPropagation()));
            // Invisible div to block mouse interaction with the menu
            const pointerBlockDiv = document.createElement('div');
            const pointerBlock = element.appendChild(pointerBlockDiv);
            pointerBlock.classList.add('context-view-pointerBlock');
            // Removes block on click INSIDE widget or ANY mouse movement
            renderDisposables.add(dom.$nO(pointerBlock, dom.$3O.POINTER_MOVE, () => pointerBlock.remove()));
            renderDisposables.add(dom.$nO(pointerBlock, dom.$3O.MOUSE_DOWN, () => pointerBlock.remove()));
            // Action bar
            let actionBarWidth = 0;
            if (actionBarActions.length) {
                const actionBar = this.h('.action-widget-action-bar', actionBarActions);
                if (actionBar) {
                    widget.appendChild(actionBar.getContainer().parentElement);
                    renderDisposables.add(actionBar);
                    actionBarWidth = actionBar.getContainer().offsetWidth;
                }
            }
            const width = this.a.value?.layout(actionBarWidth);
            widget.style.width = `${width}px`;
            const focusTracker = renderDisposables.add(dom.$8O(element));
            renderDisposables.add(focusTracker.onDidBlur(() => this.hide()));
            return renderDisposables;
        }
        h(className, actions) {
            if (!actions.length) {
                return undefined;
            }
            const container = dom.$(className);
            const actionBar = new actionbar_1.$1P(container);
            actionBar.push(actions, { icon: false, label: true });
            return actionBar;
        }
        j(didCancel) {
            this.a.value?.hide(didCancel);
        }
    };
    ActionWidgetService = __decorate([
        __param(0, contextView_1.$VZ),
        __param(1, contextkey_1.$3i),
        __param(2, instantiation_1.$Ah)
    ], ActionWidgetService);
    (0, extensions_1.$mr)(exports.$N2, ActionWidgetService, 1 /* InstantiationType.Delayed */);
    const weight = 100 /* KeybindingWeight.EditorContrib */ + 1000;
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'hideCodeActionWidget',
                title: {
                    value: (0, nls_1.localize)(2, null),
                    original: 'Hide action widget'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 9 /* KeyCode.Escape */,
                    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
                },
            });
        }
        run(accessor) {
            accessor.get(exports.$N2).hide();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'selectPrevCodeAction',
                title: {
                    value: (0, nls_1.localize)(3, null),
                    original: 'Select previous action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 16 /* KeyCode.UpArrow */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
                    mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] },
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.$N2);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.focusPrevious();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'selectNextCodeAction',
                title: {
                    value: (0, nls_1.localize)(4, null),
                    original: 'Select next action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 18 /* KeyCode.DownArrow */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */],
                    mac: { primary: 18 /* KeyCode.DownArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */] }
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.$N2);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.focusNext();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: actionList_1.$F2,
                title: {
                    value: (0, nls_1.localize)(5, null),
                    original: 'Accept selected action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 3 /* KeyCode.Enter */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */],
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.$N2);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.acceptSelected();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: actionList_1.$G2,
                title: {
                    value: (0, nls_1.localize)(6, null),
                    original: 'Preview selected action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.$N2);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.acceptSelected(true);
            }
        }
    });
});
//# sourceMappingURL=actionWidget.js.map