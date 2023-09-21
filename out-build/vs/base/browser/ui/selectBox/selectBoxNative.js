/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, dom, touch_1, arrays, event_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FQ = void 0;
    class $FQ extends lifecycle_1.$kc {
        constructor(options, selected, styles, selectBoxOptions) {
            super();
            this.f = 0;
            this.b = selectBoxOptions || Object.create(null);
            this.c = [];
            this.a = document.createElement('select');
            this.a.className = 'monaco-select-box';
            if (typeof this.b.ariaLabel === 'string') {
                this.a.setAttribute('aria-label', this.b.ariaLabel);
            }
            if (typeof this.b.ariaDescription === 'string') {
                this.a.setAttribute('aria-description', this.b.ariaDescription);
            }
            this.g = this.B(new event_1.$fd());
            this.h = styles;
            this.j();
            this.setOptions(options, selected);
        }
        j() {
            this.B(touch_1.$EP.addTarget(this.a));
            [touch_1.EventType.Tap].forEach(eventType => {
                this.B(dom.$nO(this.a, eventType, (e) => {
                    this.a.focus();
                }));
            });
            this.B(dom.$oO(this.a, 'click', (e) => {
                dom.$5O.stop(e, true);
            }));
            this.B(dom.$oO(this.a, 'change', (e) => {
                this.a.title = e.target.value;
                this.g.fire({
                    index: e.target.selectedIndex,
                    selected: e.target.value
                });
            }));
            this.B(dom.$oO(this.a, 'keydown', (e) => {
                let showSelect = false;
                if (platform_1.$j) {
                    if (e.keyCode === 18 /* KeyCode.DownArrow */ || e.keyCode === 16 /* KeyCode.UpArrow */ || e.keyCode === 10 /* KeyCode.Space */) {
                        showSelect = true;
                    }
                }
                else {
                    if (e.keyCode === 18 /* KeyCode.DownArrow */ && e.altKey || e.keyCode === 10 /* KeyCode.Space */ || e.keyCode === 3 /* KeyCode.Enter */) {
                        showSelect = true;
                    }
                }
                if (showSelect) {
                    // Space, Enter, is used to expand select box, do not propagate it (prevent action bar action run)
                    e.stopPropagation();
                }
            }));
        }
        get onDidSelect() {
            return this.g.event;
        }
        setOptions(options, selected) {
            if (!this.c || !arrays.$sb(this.c, options)) {
                this.c = options;
                this.a.options.length = 0;
                this.c.forEach((option, index) => {
                    this.a.add(this.m(option.text, index, option.isDisabled));
                });
            }
            if (selected !== undefined) {
                this.select(selected);
            }
        }
        select(index) {
            if (this.c.length === 0) {
                this.f = 0;
            }
            else if (index >= 0 && index < this.c.length) {
                this.f = index;
            }
            else if (index > this.c.length - 1) {
                // Adjust index to end of list
                // This could make client out of sync with the select
                this.select(this.c.length - 1);
            }
            else if (this.f < 0) {
                this.f = 0;
            }
            this.a.selectedIndex = this.f;
            if ((this.f < this.c.length) && typeof this.c[this.f].text === 'string') {
                this.a.title = this.c[this.f].text;
            }
            else {
                this.a.title = '';
            }
        }
        setAriaLabel(label) {
            this.b.ariaLabel = label;
            this.a.setAttribute('aria-label', label);
        }
        focus() {
            if (this.a) {
                this.a.tabIndex = 0;
                this.a.focus();
            }
        }
        blur() {
            if (this.a) {
                this.a.tabIndex = -1;
                this.a.blur();
            }
        }
        setFocusable(focusable) {
            this.a.tabIndex = focusable ? 0 : -1;
        }
        render(container) {
            container.classList.add('select-container');
            container.appendChild(this.a);
            this.setOptions(this.c, this.f);
            this.applyStyles();
        }
        style(styles) {
            this.h = styles;
            this.applyStyles();
        }
        applyStyles() {
            // Style native select
            if (this.a) {
                this.a.style.backgroundColor = this.h.selectBackground ?? '';
                this.a.style.color = this.h.selectForeground ?? '';
                this.a.style.borderColor = this.h.selectBorder ?? '';
            }
        }
        m(value, index, disabled) {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            option.disabled = !!disabled;
            return option;
        }
    }
    exports.$FQ = $FQ;
});
//# sourceMappingURL=selectBoxNative.js.map