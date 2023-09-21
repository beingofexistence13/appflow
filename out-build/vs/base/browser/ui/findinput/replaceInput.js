/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/event", "vs/nls!vs/base/browser/ui/findinput/replaceInput", "vs/css!./findInput"], function (require, exports, dom, toggle_1, inputBox_1, widget_1, codicons_1, event_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IR = void 0;
    const NLS_DEFAULT_LABEL = nls.localize(0, null);
    const NLS_PRESERVE_CASE_LABEL = nls.localize(1, null);
    class PreserveCaseToggle extends toggle_1.$KQ {
        constructor(opts) {
            super({
                // TODO: does this need its own icon?
                icon: codicons_1.$Pj.preserveCase,
                title: NLS_PRESERVE_CASE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    class $IR extends widget_1.$IP {
        static { this.OPTION_CHANGE = 'optionChange'; }
        constructor(parent, contextViewProvider, M, options) {
            super();
            this.M = M;
            this.h = true;
            this.r = 0;
            this.s = this.B(new event_1.$fd());
            this.onDidOptionChange = this.s.event;
            this.t = this.B(new event_1.$fd());
            this.onKeyDown = this.t.event;
            this.w = this.B(new event_1.$fd());
            this.onMouseDown = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onInput = this.y.event;
            this.J = this.B(new event_1.$fd());
            this.onKeyUp = this.J.event;
            this.L = this.B(new event_1.$fd());
            this.onPreserveCaseKeyDown = this.L.event;
            this.O = 0;
            this.a = contextViewProvider;
            this.b = options.placeholder || '';
            this.c = options.validation;
            this.g = options.label || NLS_DEFAULT_LABEL;
            const appendPreserveCaseLabel = options.appendPreserveCaseLabel || '';
            const history = options.history || [];
            const flexibleHeight = !!options.flexibleHeight;
            const flexibleWidth = !!options.flexibleWidth;
            const flexibleMaxHeight = options.flexibleMaxHeight;
            this.domNode = document.createElement('div');
            this.domNode.classList.add('monaco-findInput');
            this.inputBox = this.B(new inputBox_1.$tR(this.domNode, this.a, {
                ariaLabel: this.g || '',
                placeholder: this.b || '',
                validationOptions: {
                    validation: this.c
                },
                history,
                showHistoryHint: options.showHistoryHint,
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight,
                inputBoxStyles: options.inputBoxStyles
            }));
            this.n = this.B(new PreserveCaseToggle({
                appendTitle: appendPreserveCaseLabel,
                isChecked: false,
                ...options.toggleStyles
            }));
            this.B(this.n.onChange(viaKeyboard => {
                this.s.fire(viaKeyboard);
                if (!viaKeyboard && this.h) {
                    this.inputBox.focus();
                }
                this.validate();
            }));
            this.B(this.n.onKeyDown(e => {
                this.L.fire(e);
            }));
            if (this.M) {
                this.r = this.n.width();
            }
            else {
                this.r = 0;
            }
            // Arrow-Key support to navigate between options
            const indexes = [this.n.domNode];
            this.z(this.domNode, (event) => {
                if (event.equals(15 /* KeyCode.LeftArrow */) || event.equals(17 /* KeyCode.RightArrow */) || event.equals(9 /* KeyCode.Escape */)) {
                    const index = indexes.indexOf(document.activeElement);
                    if (index >= 0) {
                        let newIndex = -1;
                        if (event.equals(17 /* KeyCode.RightArrow */)) {
                            newIndex = (index + 1) % indexes.length;
                        }
                        else if (event.equals(15 /* KeyCode.LeftArrow */)) {
                            if (index === 0) {
                                newIndex = indexes.length - 1;
                            }
                            else {
                                newIndex = index - 1;
                            }
                        }
                        if (event.equals(9 /* KeyCode.Escape */)) {
                            indexes[index].blur();
                            this.inputBox.focus();
                        }
                        else if (newIndex >= 0) {
                            indexes[newIndex].focus();
                        }
                        dom.$5O.stop(event, true);
                    }
                }
            });
            const controls = document.createElement('div');
            controls.className = 'controls';
            controls.style.display = this.M ? 'block' : 'none';
            controls.appendChild(this.n.domNode);
            this.domNode.appendChild(controls);
            parent?.appendChild(this.domNode);
            this.z(this.inputBox.inputElement, (e) => this.t.fire(e));
            this.C(this.inputBox.inputElement, (e) => this.J.fire(e));
            this.D(this.inputBox.inputElement, (e) => this.y.fire());
            this.j(this.inputBox.inputElement, (e) => this.w.fire(e));
        }
        enable() {
            this.domNode.classList.remove('disabled');
            this.inputBox.enable();
            this.n.enable();
        }
        disable() {
            this.domNode.classList.add('disabled');
            this.inputBox.disable();
            this.n.disable();
        }
        setFocusInputOnOptionClick(value) {
            this.h = value;
        }
        setEnabled(enabled) {
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        clear() {
            this.P();
            this.setValue('');
            this.focus();
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            if (this.inputBox.value !== value) {
                this.inputBox.value = value;
            }
        }
        onSearchSubmit() {
            this.inputBox.addToHistory();
        }
        N() {
        }
        select() {
            this.inputBox.select();
        }
        focus() {
            this.inputBox.focus();
        }
        getPreserveCase() {
            return this.n.checked;
        }
        setPreserveCase(value) {
            this.n.checked = value;
        }
        focusOnPreserve() {
            this.n.focus();
        }
        highlightFindOptions() {
            this.domNode.classList.remove('highlight-' + (this.O));
            this.O = 1 - this.O;
            this.domNode.classList.add('highlight-' + (this.O));
        }
        validate() {
            this.inputBox?.validate();
        }
        showMessage(message) {
            this.inputBox?.showMessage(message);
        }
        clearMessage() {
            this.inputBox?.hideMessage();
        }
        P() {
            this.inputBox?.hideMessage();
        }
        set width(newWidth) {
            this.inputBox.paddingRight = this.r;
            this.domNode.style.width = newWidth + 'px';
        }
        dispose() {
            super.dispose();
        }
    }
    exports.$IR = $IR;
});
//# sourceMappingURL=replaceInput.js.map