/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/css!./toggle"], function (require, exports, actionViewItems_1, widget_1, codicons_1, themables_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LQ = exports.$KQ = exports.$JQ = exports.$IQ = void 0;
    exports.$IQ = {
        inputActiveOptionBorder: '#007ACC00',
        inputActiveOptionForeground: '#FFFFFF',
        inputActiveOptionBackground: '#0E639C50'
    };
    class $JQ extends actionViewItems_1.$MQ {
        constructor(context, action, options) {
            super(context, action, options);
            this.a = this.B(new $KQ({
                actionClassName: this._action.class,
                isChecked: !!this._action.checked,
                title: this.m.keybinding ? `${this._action.label} (${this.m.keybinding})` : this._action.label,
                notFocusable: true,
                inputActiveOptionBackground: options.toggleStyles?.inputActiveOptionBackground,
                inputActiveOptionBorder: options.toggleStyles?.inputActiveOptionBorder,
                inputActiveOptionForeground: options.toggleStyles?.inputActiveOptionForeground,
            }));
            this.B(this.a.onChange(() => this._action.checked = !!this.a && this.a.checked));
        }
        render(container) {
            this.element = container;
            this.element.appendChild(this.a.domNode);
        }
        u() {
            if (this.a) {
                if (this.isEnabled()) {
                    this.a.enable();
                }
                else {
                    this.a.disable();
                }
            }
        }
        G() {
            this.a.checked = !!this._action.checked;
        }
        focus() {
            this.a.domNode.tabIndex = 0;
            this.a.focus();
        }
        blur() {
            this.a.domNode.tabIndex = -1;
            this.a.domNode.blur();
        }
        setFocusable(focusable) {
            this.a.domNode.tabIndex = focusable ? 0 : -1;
        }
    }
    exports.$JQ = $JQ;
    class $KQ extends widget_1.$IP {
        constructor(opts) {
            super();
            this.a = this.B(new event_1.$fd());
            this.onChange = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onKeyDown = this.b.event;
            this.c = opts;
            this.s = this.c.isChecked;
            const classes = ['monaco-custom-toggle'];
            if (this.c.icon) {
                this.g = this.c.icon;
                classes.push(...themables_1.ThemeIcon.asClassNameArray(this.g));
            }
            if (this.c.actionClassName) {
                classes.push(...this.c.actionClassName.split(' '));
            }
            if (this.s) {
                classes.push('checked');
            }
            this.domNode = document.createElement('div');
            this.domNode.title = this.c.title;
            this.domNode.classList.add(...classes);
            if (!this.c.notFocusable) {
                this.domNode.tabIndex = 0;
            }
            this.domNode.setAttribute('role', 'checkbox');
            this.domNode.setAttribute('aria-checked', String(this.s));
            this.domNode.setAttribute('aria-label', this.c.title);
            this.t();
            this.f(this.domNode, (ev) => {
                if (this.enabled) {
                    this.checked = !this.s;
                    this.a.fire(false);
                    ev.preventDefault();
                }
            });
            this.B(this.I(this.domNode));
            this.z(this.domNode, (keyboardEvent) => {
                if (keyboardEvent.keyCode === 10 /* KeyCode.Space */ || keyboardEvent.keyCode === 3 /* KeyCode.Enter */) {
                    this.checked = !this.s;
                    this.a.fire(true);
                    keyboardEvent.preventDefault();
                    keyboardEvent.stopPropagation();
                    return;
                }
                this.b.fire(keyboardEvent);
            });
        }
        get enabled() {
            return this.domNode.getAttribute('aria-disabled') !== 'true';
        }
        focus() {
            this.domNode.focus();
        }
        get checked() {
            return this.s;
        }
        set checked(newIsChecked) {
            this.s = newIsChecked;
            this.domNode.setAttribute('aria-checked', String(this.s));
            this.domNode.classList.toggle('checked', this.s);
            this.t();
        }
        setIcon(icon) {
            if (this.g) {
                this.domNode.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this.g));
            }
            this.g = icon;
            if (this.g) {
                this.domNode.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.g));
            }
        }
        width() {
            return 2 /*margin left*/ + 2 /*border*/ + 2 /*padding*/ + 16 /* icon width */;
        }
        t() {
            if (this.domNode) {
                this.domNode.style.borderColor = (this.s && this.c.inputActiveOptionBorder) || '';
                this.domNode.style.color = (this.s && this.c.inputActiveOptionForeground) || 'inherit';
                this.domNode.style.backgroundColor = (this.s && this.c.inputActiveOptionBackground) || '';
            }
        }
        enable() {
            this.domNode.setAttribute('aria-disabled', String(false));
        }
        disable() {
            this.domNode.setAttribute('aria-disabled', String(true));
        }
        setTitle(newTitle) {
            this.domNode.title = newTitle;
            this.domNode.setAttribute('aria-label', newTitle);
        }
    }
    exports.$KQ = $KQ;
    class $LQ extends widget_1.$IP {
        constructor(c, g, styles) {
            super();
            this.c = c;
            this.g = g;
            this.a = new $KQ({ title: this.c, isChecked: this.g, icon: codicons_1.$Pj.check, actionClassName: 'monaco-checkbox', ...exports.$IQ });
            this.domNode = this.a.domNode;
            this.b = styles;
            this.h();
            this.B(this.a.onChange(() => this.h()));
        }
        get checked() {
            return this.a.checked;
        }
        set checked(newIsChecked) {
            this.a.checked = newIsChecked;
            this.h();
        }
        focus() {
            this.domNode.focus();
        }
        hasFocus() {
            return this.domNode === document.activeElement;
        }
        h() {
            this.domNode.style.color = this.b.checkboxForeground || '';
            this.domNode.style.backgroundColor = this.b.checkboxBackground || '';
            this.domNode.style.borderColor = this.b.checkboxBorder || '';
        }
    }
    exports.$LQ = $LQ;
});
//# sourceMappingURL=toggle.js.map