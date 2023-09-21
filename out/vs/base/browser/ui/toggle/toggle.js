/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/css!./toggle"], function (require, exports, actionViewItems_1, widget_1, codicons_1, themables_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Checkbox = exports.Toggle = exports.ToggleActionViewItem = exports.unthemedToggleStyles = void 0;
    exports.unthemedToggleStyles = {
        inputActiveOptionBorder: '#007ACC00',
        inputActiveOptionForeground: '#FFFFFF',
        inputActiveOptionBackground: '#0E639C50'
    };
    class ToggleActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(context, action, options) {
            super(context, action, options);
            this.toggle = this._register(new Toggle({
                actionClassName: this._action.class,
                isChecked: !!this._action.checked,
                title: this.options.keybinding ? `${this._action.label} (${this.options.keybinding})` : this._action.label,
                notFocusable: true,
                inputActiveOptionBackground: options.toggleStyles?.inputActiveOptionBackground,
                inputActiveOptionBorder: options.toggleStyles?.inputActiveOptionBorder,
                inputActiveOptionForeground: options.toggleStyles?.inputActiveOptionForeground,
            }));
            this._register(this.toggle.onChange(() => this._action.checked = !!this.toggle && this.toggle.checked));
        }
        render(container) {
            this.element = container;
            this.element.appendChild(this.toggle.domNode);
        }
        updateEnabled() {
            if (this.toggle) {
                if (this.isEnabled()) {
                    this.toggle.enable();
                }
                else {
                    this.toggle.disable();
                }
            }
        }
        updateChecked() {
            this.toggle.checked = !!this._action.checked;
        }
        focus() {
            this.toggle.domNode.tabIndex = 0;
            this.toggle.focus();
        }
        blur() {
            this.toggle.domNode.tabIndex = -1;
            this.toggle.domNode.blur();
        }
        setFocusable(focusable) {
            this.toggle.domNode.tabIndex = focusable ? 0 : -1;
        }
    }
    exports.ToggleActionViewItem = ToggleActionViewItem;
    class Toggle extends widget_1.Widget {
        constructor(opts) {
            super();
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._onKeyDown = this._register(new event_1.Emitter());
            this.onKeyDown = this._onKeyDown.event;
            this._opts = opts;
            this._checked = this._opts.isChecked;
            const classes = ['monaco-custom-toggle'];
            if (this._opts.icon) {
                this._icon = this._opts.icon;
                classes.push(...themables_1.ThemeIcon.asClassNameArray(this._icon));
            }
            if (this._opts.actionClassName) {
                classes.push(...this._opts.actionClassName.split(' '));
            }
            if (this._checked) {
                classes.push('checked');
            }
            this.domNode = document.createElement('div');
            this.domNode.title = this._opts.title;
            this.domNode.classList.add(...classes);
            if (!this._opts.notFocusable) {
                this.domNode.tabIndex = 0;
            }
            this.domNode.setAttribute('role', 'checkbox');
            this.domNode.setAttribute('aria-checked', String(this._checked));
            this.domNode.setAttribute('aria-label', this._opts.title);
            this.applyStyles();
            this.onclick(this.domNode, (ev) => {
                if (this.enabled) {
                    this.checked = !this._checked;
                    this._onChange.fire(false);
                    ev.preventDefault();
                }
            });
            this._register(this.ignoreGesture(this.domNode));
            this.onkeydown(this.domNode, (keyboardEvent) => {
                if (keyboardEvent.keyCode === 10 /* KeyCode.Space */ || keyboardEvent.keyCode === 3 /* KeyCode.Enter */) {
                    this.checked = !this._checked;
                    this._onChange.fire(true);
                    keyboardEvent.preventDefault();
                    keyboardEvent.stopPropagation();
                    return;
                }
                this._onKeyDown.fire(keyboardEvent);
            });
        }
        get enabled() {
            return this.domNode.getAttribute('aria-disabled') !== 'true';
        }
        focus() {
            this.domNode.focus();
        }
        get checked() {
            return this._checked;
        }
        set checked(newIsChecked) {
            this._checked = newIsChecked;
            this.domNode.setAttribute('aria-checked', String(this._checked));
            this.domNode.classList.toggle('checked', this._checked);
            this.applyStyles();
        }
        setIcon(icon) {
            if (this._icon) {
                this.domNode.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this._icon));
            }
            this._icon = icon;
            if (this._icon) {
                this.domNode.classList.add(...themables_1.ThemeIcon.asClassNameArray(this._icon));
            }
        }
        width() {
            return 2 /*margin left*/ + 2 /*border*/ + 2 /*padding*/ + 16 /* icon width */;
        }
        applyStyles() {
            if (this.domNode) {
                this.domNode.style.borderColor = (this._checked && this._opts.inputActiveOptionBorder) || '';
                this.domNode.style.color = (this._checked && this._opts.inputActiveOptionForeground) || 'inherit';
                this.domNode.style.backgroundColor = (this._checked && this._opts.inputActiveOptionBackground) || '';
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
    exports.Toggle = Toggle;
    class Checkbox extends widget_1.Widget {
        constructor(title, isChecked, styles) {
            super();
            this.title = title;
            this.isChecked = isChecked;
            this.checkbox = new Toggle({ title: this.title, isChecked: this.isChecked, icon: codicons_1.Codicon.check, actionClassName: 'monaco-checkbox', ...exports.unthemedToggleStyles });
            this.domNode = this.checkbox.domNode;
            this.styles = styles;
            this.applyStyles();
            this._register(this.checkbox.onChange(() => this.applyStyles()));
        }
        get checked() {
            return this.checkbox.checked;
        }
        set checked(newIsChecked) {
            this.checkbox.checked = newIsChecked;
            this.applyStyles();
        }
        focus() {
            this.domNode.focus();
        }
        hasFocus() {
            return this.domNode === document.activeElement;
        }
        applyStyles() {
            this.domNode.style.color = this.styles.checkboxForeground || '';
            this.domNode.style.backgroundColor = this.styles.checkboxBackground || '';
            this.domNode.style.borderColor = this.styles.checkboxBorder || '';
        }
    }
    exports.Checkbox = Checkbox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3RvZ2dsZS90b2dnbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NuRixRQUFBLG9CQUFvQixHQUFHO1FBQ25DLHVCQUF1QixFQUFFLFdBQVc7UUFDcEMsMkJBQTJCLEVBQUUsU0FBUztRQUN0QywyQkFBMkIsRUFBRSxXQUFXO0tBQ3hDLENBQUM7SUFFRixNQUFhLG9CQUFxQixTQUFRLG9DQUFrQjtRQUkzRCxZQUFZLE9BQVksRUFBRSxNQUFlLEVBQUUsT0FBK0I7WUFDekUsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksTUFBTSxDQUFDO2dCQUN2QyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2dCQUNuQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTztnQkFDakMsS0FBSyxFQUEyQixJQUFJLENBQUMsT0FBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBOEIsSUFBSSxDQUFDLE9BQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2dCQUM5SixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsMkJBQTJCLEVBQUUsT0FBTyxDQUFDLFlBQVksRUFBRSwyQkFBMkI7Z0JBQzlFLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxZQUFZLEVBQUUsdUJBQXVCO2dCQUN0RSwyQkFBMkIsRUFBRSxPQUFPLENBQUMsWUFBWSxFQUFFLDJCQUEyQjthQUM5RSxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUks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