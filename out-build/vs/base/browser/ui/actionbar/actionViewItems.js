/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls!vs/base/browser/ui/actionbar/actionViewItems", "vs/css!./actionbar"], function (require, exports, browser_1, dnd_1, dom_1, touch_1, iconLabelHover_1, selectBox_1, actions_1, lifecycle_1, platform, types, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OQ = exports.$NQ = exports.$MQ = void 0;
    class $MQ extends lifecycle_1.$kc {
        get action() {
            return this._action;
        }
        constructor(context, action, m = {}) {
            super();
            this.m = m;
            this._context = context || this;
            this._action = action;
            if (action instanceof actions_1.$gi) {
                this.B(action.onDidChange(event => {
                    if (!this.element) {
                        // we have not been rendered yet, so there
                        // is no point in updating the UI
                        return;
                    }
                    this.t(event);
                }));
            }
        }
        t(event) {
            if (event.enabled !== undefined) {
                this.u();
            }
            if (event.checked !== undefined) {
                this.G();
            }
            if (event.class !== undefined) {
                this.F();
            }
            if (event.label !== undefined) {
                this.w();
                this.C();
            }
            if (event.tooltip !== undefined) {
                this.C();
            }
        }
        get actionRunner() {
            if (!this.j) {
                this.j = this.B(new actions_1.$hi());
            }
            return this.j;
        }
        set actionRunner(actionRunner) {
            this.j = actionRunner;
        }
        isEnabled() {
            return this._action.enabled;
        }
        setActionContext(newContext) {
            this._context = newContext;
        }
        render(container) {
            const element = this.element = container;
            this.B(touch_1.$EP.addTarget(container));
            const enableDragging = this.m && this.m.draggable;
            if (enableDragging) {
                container.draggable = true;
                if (browser_1.$5N) {
                    // Firefox: requires to set a text data transfer to get going
                    this.B((0, dom_1.$nO)(container, dom_1.$3O.DRAG_START, e => e.dataTransfer?.setData(dnd_1.$CP.TEXT, this._action.label)));
                }
            }
            this.B((0, dom_1.$nO)(element, touch_1.EventType.Tap, e => this.onClick(e, true))); // Preserve focus on tap #125470
            this.B((0, dom_1.$nO)(element, dom_1.$3O.MOUSE_DOWN, e => {
                if (!enableDragging) {
                    dom_1.$5O.stop(e, true); // do not run when dragging is on because that would disable it
                }
                if (this._action.enabled && e.button === 0) {
                    element.classList.add('active');
                }
            }));
            if (platform.$j) {
                // macOS: allow to trigger the button when holding Ctrl+key and pressing the
                // main mouse button. This is for scenarios where e.g. some interaction forces
                // the Ctrl+key to be pressed and hold but the user still wants to interact
                // with the actions (for example quick access in quick navigation mode).
                this.B((0, dom_1.$nO)(element, dom_1.$3O.CONTEXT_MENU, e => {
                    if (e.button === 0 && e.ctrlKey === true) {
                        this.onClick(e);
                    }
                }));
            }
            this.B((0, dom_1.$nO)(element, dom_1.$3O.CLICK, e => {
                dom_1.$5O.stop(e, true);
                // menus do not use the click event
                if (!(this.m && this.m.isMenu)) {
                    this.onClick(e);
                }
            }));
            this.B((0, dom_1.$nO)(element, dom_1.$3O.DBLCLICK, e => {
                dom_1.$5O.stop(e, true);
            }));
            [dom_1.$3O.MOUSE_UP, dom_1.$3O.MOUSE_OUT].forEach(event => {
                this.B((0, dom_1.$nO)(element, event, e => {
                    dom_1.$5O.stop(e);
                    element.classList.remove('active');
                }));
            });
        }
        onClick(event, preserveFocus = false) {
            dom_1.$5O.stop(event, true);
            const context = types.$sf(this._context) ? this.m?.useEventAsContext ? event : { preserveFocus } : this._context;
            this.actionRunner.run(this._action, context);
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.element) {
                this.element.tabIndex = 0;
                this.element.focus();
                this.element.classList.add('focused');
            }
        }
        isFocused() {
            return !!this.element?.classList.contains('focused');
        }
        blur() {
            if (this.element) {
                this.element.blur();
                this.element.tabIndex = -1;
                this.element.classList.remove('focused');
            }
        }
        setFocusable(focusable) {
            if (this.element) {
                this.element.tabIndex = focusable ? 0 : -1;
            }
        }
        get trapsArrowNavigation() {
            return false;
        }
        u() {
            // implement in subclass
        }
        w() {
            // implement in subclass
        }
        z() {
            return this.action.tooltip;
        }
        C() {
            if (!this.element) {
                return;
            }
            const title = this.z() ?? '';
            this.D();
            if (!this.m.hoverDelegate) {
                this.element.title = title;
            }
            else {
                this.element.title = '';
                if (!this.f) {
                    this.f = (0, iconLabelHover_1.$ZP)(this.m.hoverDelegate, this.element, title);
                    this.q.add(this.f);
                }
                else {
                    this.f.update(title);
                }
            }
        }
        D() {
            if (this.element) {
                const title = this.z() ?? '';
                this.element.setAttribute('aria-label', title);
            }
        }
        F() {
            // implement in subclass
        }
        G() {
            // implement in subclass
        }
        dispose() {
            if (this.element) {
                this.element.remove();
                this.element = undefined;
            }
            this._context = undefined;
            super.dispose();
        }
    }
    exports.$MQ = $MQ;
    class $NQ extends $MQ {
        constructor(context, action, options) {
            super(context, action, options);
            this.m = options;
            this.m.icon = options.icon !== undefined ? options.icon : false;
            this.m.label = options.label !== undefined ? options.label : true;
            this.J = '';
        }
        render(container) {
            super.render(container);
            if (this.element) {
                this.H = (0, dom_1.$0O)(this.element, (0, dom_1.$)('a.action-label'));
            }
            if (this.H) {
                this.H.setAttribute('role', this.L());
            }
            if (this.m.label && this.m.keybinding && this.element) {
                (0, dom_1.$0O)(this.element, (0, dom_1.$)('span.keybinding')).textContent = this.m.keybinding;
            }
            this.F();
            this.w();
            this.C();
            this.u();
            this.G();
        }
        L() {
            if (this._action.id === actions_1.$ii.ID) {
                return 'presentation'; // A separator is a presentation item
            }
            else {
                if (this.m.isMenu) {
                    return 'menuitem';
                }
                else {
                    return 'button';
                }
            }
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.H) {
                this.H.tabIndex = 0;
                this.H.focus();
            }
        }
        isFocused() {
            return !!this.H && this.H?.tabIndex === 0;
        }
        blur() {
            if (this.H) {
                this.H.tabIndex = -1;
            }
        }
        setFocusable(focusable) {
            if (this.H) {
                this.H.tabIndex = focusable ? 0 : -1;
            }
        }
        w() {
            if (this.m.label && this.H) {
                this.H.textContent = this.action.label;
            }
        }
        z() {
            let title = null;
            if (this.action.tooltip) {
                title = this.action.tooltip;
            }
            else if (!this.m.label && this.action.label && this.m.icon) {
                title = this.action.label;
                if (this.m.keybinding) {
                    title = nls.localize(0, null, title, this.m.keybinding);
                }
            }
            return title ?? undefined;
        }
        F() {
            if (this.J && this.H) {
                this.H.classList.remove(...this.J.split(' '));
            }
            if (this.m.icon) {
                this.J = this.action.class;
                if (this.H) {
                    this.H.classList.add('codicon');
                    if (this.J) {
                        this.H.classList.add(...this.J.split(' '));
                    }
                }
                this.u();
            }
            else {
                this.H?.classList.remove('codicon');
            }
        }
        u() {
            if (this.action.enabled) {
                if (this.H) {
                    this.H.removeAttribute('aria-disabled');
                    this.H.classList.remove('disabled');
                }
                this.element?.classList.remove('disabled');
            }
            else {
                if (this.H) {
                    this.H.setAttribute('aria-disabled', 'true');
                    this.H.classList.add('disabled');
                }
                this.element?.classList.add('disabled');
            }
        }
        D() {
            if (this.H) {
                const title = this.z() ?? '';
                this.H.setAttribute('aria-label', title);
            }
        }
        G() {
            if (this.H) {
                if (this.action.checked !== undefined) {
                    this.H.classList.toggle('checked', this.action.checked);
                    this.H.setAttribute('aria-checked', this.action.checked ? 'true' : 'false');
                    this.H.setAttribute('role', 'checkbox');
                }
                else {
                    this.H.classList.remove('checked');
                    this.H.setAttribute('aria-checked', '');
                    this.H.setAttribute('role', this.L());
                }
            }
        }
    }
    exports.$NQ = $NQ;
    class $OQ extends $MQ {
        constructor(ctx, action, options, selected, contextViewProvider, styles, selectBoxOptions) {
            super(ctx, action);
            this.b = new selectBox_1.$HQ(options, selected, contextViewProvider, styles, selectBoxOptions);
            this.b.setFocusable(false);
            this.B(this.b);
            this.g();
        }
        setOptions(options, selected) {
            this.b.setOptions(options, selected);
        }
        select(index) {
            this.b.select(index);
        }
        g() {
            this.B(this.b.onDidSelect(e => this.n(e.selected, e.index)));
        }
        n(option, index) {
            this.actionRunner.run(this._action, this.r(option, index));
        }
        r(option, index) {
            return option;
        }
        setFocusable(focusable) {
            this.b.setFocusable(focusable);
        }
        focus() {
            this.b?.focus();
        }
        blur() {
            this.b?.blur();
        }
        render(container) {
            this.b.render(container);
        }
    }
    exports.$OQ = $OQ;
});
//# sourceMappingURL=actionViewItems.js.map