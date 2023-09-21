/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdown", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/css!./dropdown"], function (require, exports, nls, dom_1, keyboardEvent_1, actionViewItems_1, dropdown_1, actions_1, codicons_1, themables_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DR = exports.$CR = void 0;
    class $CR extends actionViewItems_1.$MQ {
        constructor(action, menuActionsOrProvider, contextMenuProvider, options = Object.create(null)) {
            super(null, action, options);
            this.H = null;
            this.I = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.I.event;
            this.b = menuActionsOrProvider;
            this.y = contextMenuProvider;
            this.m = options;
            if (this.m.actionRunner) {
                this.actionRunner = this.m.actionRunner;
            }
        }
        render(container) {
            this.H = container;
            const labelRenderer = (el) => {
                this.element = (0, dom_1.$0O)(el, (0, dom_1.$)('a.action-label'));
                let classNames = [];
                if (typeof this.m.classNames === 'string') {
                    classNames = this.m.classNames.split(/\s+/g).filter(s => !!s);
                }
                else if (this.m.classNames) {
                    classNames = this.m.classNames;
                }
                // todo@aeschli: remove codicon, should come through `this.options.classNames`
                if (!classNames.find(c => c === 'icon')) {
                    classNames.push('codicon');
                }
                this.element.classList.add(...classNames);
                this.element.setAttribute('role', 'button');
                this.element.setAttribute('aria-haspopup', 'true');
                this.element.setAttribute('aria-expanded', 'false');
                this.element.title = this._action.label || '';
                this.element.ariaLabel = this._action.label || '';
                return null;
            };
            const isActionsArray = Array.isArray(this.b);
            const options = {
                contextMenuProvider: this.y,
                labelRenderer: labelRenderer,
                menuAsChild: this.m.menuAsChild,
                actions: isActionsArray ? this.b : undefined,
                actionProvider: isActionsArray ? undefined : this.b,
                skipTelemetry: this.m.skipTelemetry
            };
            this.n = this.B(new dropdown_1.$BR(container, options));
            this.B(this.n.onDidChangeVisibility(visible => {
                this.element?.setAttribute('aria-expanded', `${visible}`);
                this.I.fire(visible);
            }));
            this.n.menuOptions = {
                actionViewItemProvider: this.m.actionViewItemProvider,
                actionRunner: this.actionRunner,
                getKeyBinding: this.m.keybindingProvider,
                context: this._context
            };
            if (this.m.anchorAlignmentProvider) {
                const that = this;
                this.n.menuOptions = {
                    ...this.n.menuOptions,
                    get anchorAlignment() {
                        return that.m.anchorAlignmentProvider();
                    }
                };
            }
            this.C();
            this.u();
        }
        z() {
            let title = null;
            if (this.action.tooltip) {
                title = this.action.tooltip;
            }
            else if (this.action.label) {
                title = this.action.label;
            }
            return title ?? undefined;
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            if (this.n) {
                if (this.n.menuOptions) {
                    this.n.menuOptions.context = newContext;
                }
                else {
                    this.n.menuOptions = { context: newContext };
                }
            }
        }
        show() {
            this.n?.show();
        }
        u() {
            const disabled = !this.action.enabled;
            this.H?.classList.toggle('disabled', disabled);
            this.element?.classList.toggle('disabled', disabled);
        }
    }
    exports.$CR = $CR;
    class $DR extends actionViewItems_1.$NQ {
        constructor(context, action, options, g) {
            super(context, action, options);
            this.g = g;
        }
        render(container) {
            super.render(container);
            if (this.element) {
                this.element.classList.add('action-dropdown-item');
                const menuActionsProvider = {
                    getActions: () => {
                        const actionsProvider = this.m.menuActionsOrProvider;
                        return Array.isArray(actionsProvider) ? actionsProvider : actionsProvider.getActions(); // TODO: microsoft/TypeScript#42768
                    }
                };
                const menuActionClassNames = this.m.menuActionClassNames || [];
                const separator = (0, dom_1.h)('div.action-dropdown-item-separator', [(0, dom_1.h)('div', {})]).root;
                separator.classList.toggle('prominent', menuActionClassNames.includes('prominent'));
                (0, dom_1.$0O)(this.element, separator);
                this.b = new $CR(this.B(new actions_1.$gi('dropdownAction', nls.localize(0, null))), menuActionsProvider, this.g, { classNames: ['dropdown', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.dropDownButton), ...menuActionClassNames] });
                this.b.render(this.element);
                this.B((0, dom_1.$nO)(this.element, dom_1.$3O.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.$jO(e);
                    let handled = false;
                    if (this.b?.isFocused() && event.equals(15 /* KeyCode.LeftArrow */)) {
                        handled = true;
                        this.b?.blur();
                        this.focus();
                    }
                    else if (this.isFocused() && event.equals(17 /* KeyCode.RightArrow */)) {
                        handled = true;
                        this.blur();
                        this.b?.focus();
                    }
                    if (handled) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }));
            }
        }
        blur() {
            super.blur();
            this.b?.blur();
        }
        setFocusable(focusable) {
            super.setFocusable(focusable);
            this.b?.setFocusable(focusable);
        }
    }
    exports.$DR = $DR;
});
//# sourceMappingURL=dropdownActionViewItem.js.map