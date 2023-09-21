/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls!vs/base/browser/ui/button/button", "vs/css!./button"], function (require, exports, dom_1, dompurify_1, keyboardEvent_1, markdownRenderer_1, touch_1, iconLabels_1, actions_1, codicons_1, color_1, event_1, htmlContent_1, lifecycle_1, themables_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0Q = exports.$9Q = exports.$8Q = exports.$7Q = exports.$6Q = void 0;
    exports.$6Q = {
        buttonBackground: '#0E639C',
        buttonHoverBackground: '#006BB3',
        buttonSeparator: color_1.$Os.white.toString(),
        buttonForeground: color_1.$Os.white.toString(),
        buttonBorder: undefined,
        buttonSecondaryBackground: undefined,
        buttonSecondaryForeground: undefined,
        buttonSecondaryHoverBackground: undefined
    };
    class $7Q extends lifecycle_1.$kc {
        get onDidClick() { return this.h.event; }
        constructor(container, options) {
            super();
            this.c = '';
            this.h = this.B(new event_1.$fd());
            this.a = options;
            this.b = document.createElement('a');
            this.b.classList.add('monaco-button');
            this.b.tabIndex = 0;
            this.b.setAttribute('role', 'button');
            this.b.classList.toggle('secondary', !!options.secondary);
            const background = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
            const foreground = options.secondary ? options.buttonSecondaryForeground : options.buttonForeground;
            this.b.style.color = foreground || '';
            this.b.style.backgroundColor = background || '';
            if (options.supportShortLabel) {
                this.g = document.createElement('div');
                this.g.classList.add('monaco-button-label-short');
                this.b.appendChild(this.g);
                this.f = document.createElement('div');
                this.f.classList.add('monaco-button-label');
                this.b.appendChild(this.f);
                this.b.classList.add('monaco-text-button-with-short-label');
            }
            container.appendChild(this.b);
            this.B(touch_1.$EP.addTarget(this.b));
            [dom_1.$3O.CLICK, touch_1.EventType.Tap].forEach(eventType => {
                this.B((0, dom_1.$nO)(this.b, eventType, e => {
                    if (!this.enabled) {
                        dom_1.$5O.stop(e);
                        return;
                    }
                    this.h.fire(e);
                }));
            });
            this.B((0, dom_1.$nO)(this.b, dom_1.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                let eventHandled = false;
                if (this.enabled && (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */))) {
                    this.h.fire(e);
                    eventHandled = true;
                }
                else if (event.equals(9 /* KeyCode.Escape */)) {
                    this.b.blur();
                    eventHandled = true;
                }
                if (eventHandled) {
                    dom_1.$5O.stop(event, true);
                }
            }));
            this.B((0, dom_1.$nO)(this.b, dom_1.$3O.MOUSE_OVER, e => {
                if (!this.b.classList.contains('disabled')) {
                    this.n(true);
                }
            }));
            this.B((0, dom_1.$nO)(this.b, dom_1.$3O.MOUSE_OUT, e => {
                this.n(false); // restore standard styles
            }));
            // Also set hover background when button is focused for feedback
            this.j = this.B((0, dom_1.$8O)(this.b));
            this.B(this.j.onDidFocus(() => { if (this.enabled) {
                this.n(true);
            } }));
            this.B(this.j.onDidBlur(() => { if (this.enabled) {
                this.n(false);
            } }));
        }
        dispose() {
            super.dispose();
            this.b.remove();
        }
        m(content) {
            const elements = [];
            for (let segment of (0, iconLabels_1.$xQ)(content)) {
                if (typeof (segment) === 'string') {
                    segment = segment.trim();
                    // Ignore empty segment
                    if (segment === '') {
                        continue;
                    }
                    // Convert string segments to <span> nodes
                    const node = document.createElement('span');
                    node.textContent = segment;
                    elements.push(node);
                }
                else {
                    elements.push(segment);
                }
            }
            return elements;
        }
        n(hover) {
            let background;
            if (this.a.secondary) {
                background = hover ? this.a.buttonSecondaryHoverBackground : this.a.buttonSecondaryBackground;
            }
            else {
                background = hover ? this.a.buttonHoverBackground : this.a.buttonBackground;
            }
            if (background) {
                this.b.style.backgroundColor = background;
            }
        }
        get element() {
            return this.b;
        }
        set label(value) {
            if (this.c === value) {
                return;
            }
            if ((0, htmlContent_1.$Zj)(this.c) && (0, htmlContent_1.$Zj)(value) && (0, htmlContent_1.$1j)(this.c, value)) {
                return;
            }
            this.b.classList.add('monaco-text-button');
            const labelElement = this.a.supportShortLabel ? this.f : this.b;
            if ((0, htmlContent_1.$Zj)(value)) {
                const rendered = (0, markdownRenderer_1.$zQ)(value, { inline: true });
                rendered.dispose();
                // Don't include outer `<p>`
                const root = rendered.element.querySelector('p')?.innerHTML;
                if (root) {
                    // Only allow a very limited set of inline html tags
                    const sanitized = (0, dompurify_1.sanitize)(root, { ADD_TAGS: ['b', 'i', 'u', 'code', 'span'], ALLOWED_ATTR: ['class'], RETURN_TRUSTED_TYPE: true });
                    labelElement.innerHTML = sanitized;
                }
                else {
                    (0, dom_1.$_O)(labelElement);
                }
            }
            else {
                if (this.a.supportIcons) {
                    (0, dom_1.$_O)(labelElement, ...this.m(value));
                }
                else {
                    labelElement.textContent = value;
                }
            }
            if (typeof this.a.title === 'string') {
                this.b.title = this.a.title;
            }
            else if (this.a.title) {
                this.b.title = (0, markdownRenderer_1.$BQ)(value);
            }
            this.c = value;
        }
        get label() {
            return this.c;
        }
        set labelShort(value) {
            if (!this.a.supportShortLabel || !this.g) {
                return;
            }
            if (this.a.supportIcons) {
                (0, dom_1.$_O)(this.g, ...this.m(value));
            }
            else {
                this.g.textContent = value;
            }
        }
        set icon(icon) {
            this.b.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
        }
        set enabled(value) {
            if (value) {
                this.b.classList.remove('disabled');
                this.b.setAttribute('aria-disabled', String(false));
                this.b.tabIndex = 0;
            }
            else {
                this.b.classList.add('disabled');
                this.b.setAttribute('aria-disabled', String(true));
            }
        }
        get enabled() {
            return !this.b.classList.contains('disabled');
        }
        focus() {
            this.b.focus();
        }
        hasFocus() {
            return this.b === document.activeElement;
        }
    }
    exports.$7Q = $7Q;
    class $8Q extends lifecycle_1.$kc {
        constructor(container, options) {
            super();
            this.h = this.B(new event_1.$fd());
            this.onDidClick = this.h.event;
            this.element = document.createElement('div');
            this.element.classList.add('monaco-button-dropdown');
            container.appendChild(this.element);
            this.a = this.B(new $7Q(this.element, options));
            this.B(this.a.onDidClick(e => this.h.fire(e)));
            this.b = this.B(new actions_1.$gi('primaryAction', (0, markdownRenderer_1.$BQ)(this.a.label), undefined, true, async () => this.h.fire(undefined)));
            this.f = document.createElement('div');
            this.f.classList.add('monaco-button-dropdown-separator');
            this.g = document.createElement('div');
            this.f.appendChild(this.g);
            this.element.appendChild(this.f);
            // Separator styles
            const border = options.buttonBorder;
            if (border) {
                this.f.style.borderTop = '1px solid ' + border;
                this.f.style.borderBottom = '1px solid ' + border;
            }
            const buttonBackground = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
            this.f.style.backgroundColor = buttonBackground ?? '';
            this.g.style.backgroundColor = options.buttonSeparator ?? '';
            this.c = this.B(new $7Q(this.element, { ...options, title: false, supportIcons: true }));
            this.c.element.title = (0, nls_1.localize)(0, null);
            this.c.element.setAttribute('aria-haspopup', 'true');
            this.c.element.setAttribute('aria-expanded', 'false');
            this.c.element.classList.add('monaco-dropdown-button');
            this.c.icon = codicons_1.$Pj.dropDownButton;
            this.B(this.c.onDidClick(e => {
                options.contextMenuProvider.showContextMenu({
                    getAnchor: () => this.c.element,
                    getActions: () => options.addPrimaryActionToDropdown === false ? [...options.actions] : [this.b, ...options.actions],
                    actionRunner: options.actionRunner,
                    onHide: () => this.c.element.setAttribute('aria-expanded', 'false')
                });
                this.c.element.setAttribute('aria-expanded', 'true');
            }));
        }
        dispose() {
            super.dispose();
            this.element.remove();
        }
        set label(value) {
            this.a.label = value;
            this.b.label = value;
        }
        set icon(icon) {
            this.a.icon = icon;
        }
        set enabled(enabled) {
            this.a.enabled = enabled;
            this.c.enabled = enabled;
            this.element.classList.toggle('disabled', !enabled);
        }
        get enabled() {
            return this.a.enabled;
        }
        focus() {
            this.a.focus();
        }
        hasFocus() {
            return this.a.hasFocus() || this.c.hasFocus();
        }
    }
    exports.$8Q = $8Q;
    class $9Q {
        constructor(container, d) {
            this.d = d;
            this.b = document.createElement('div');
            this.b.classList.add('monaco-description-button');
            this.a = new $7Q(this.b, d);
            this.c = document.createElement('div');
            this.c.classList.add('monaco-button-description');
            this.b.appendChild(this.c);
            container.appendChild(this.b);
        }
        get onDidClick() {
            return this.a.onDidClick;
        }
        get element() {
            return this.b;
        }
        set label(value) {
            this.a.label = value;
        }
        set icon(icon) {
            this.a.icon = icon;
        }
        get enabled() {
            return this.a.enabled;
        }
        set enabled(enabled) {
            this.a.enabled = enabled;
        }
        focus() {
            this.a.focus();
        }
        hasFocus() {
            return this.a.hasFocus();
        }
        dispose() {
            this.a.dispose();
        }
        set description(value) {
            if (this.d.supportIcons) {
                (0, dom_1.$_O)(this.c, ...(0, iconLabels_1.$xQ)(value));
            }
            else {
                this.c.textContent = value;
            }
        }
    }
    exports.$9Q = $9Q;
    class $0Q {
        constructor(c) {
            this.c = c;
            this.a = [];
            this.b = new lifecycle_1.$jc();
        }
        dispose() {
            this.b.dispose();
        }
        get buttons() {
            return this.a;
        }
        clear() {
            this.b.clear();
            this.a.length = 0;
        }
        addButton(options) {
            const button = this.b.add(new $7Q(this.c, options));
            this.d(button);
            return button;
        }
        addButtonWithDescription(options) {
            const button = this.b.add(new $9Q(this.c, options));
            this.d(button);
            return button;
        }
        addButtonWithDropdown(options) {
            const button = this.b.add(new $8Q(this.c, options));
            this.d(button);
            return button;
        }
        d(button) {
            this.a.push(button);
            const index = this.a.length - 1;
            this.b.add((0, dom_1.$nO)(button.element, dom_1.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                let eventHandled = true;
                // Next / Previous Button
                let buttonIndexToFocus;
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    buttonIndexToFocus = index > 0 ? index - 1 : this.a.length - 1;
                }
                else if (event.equals(17 /* KeyCode.RightArrow */)) {
                    buttonIndexToFocus = index === this.a.length - 1 ? 0 : index + 1;
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled && typeof buttonIndexToFocus === 'number') {
                    this.a[buttonIndexToFocus].focus();
                    dom_1.$5O.stop(e, true);
                }
            }));
        }
    }
    exports.$0Q = $0Q;
});
//# sourceMappingURL=button.js.map