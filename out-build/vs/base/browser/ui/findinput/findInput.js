/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInputToggles", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/nls!vs/base/browser/ui/findinput/findInput", "vs/base/common/lifecycle", "vs/css!./findInput"], function (require, exports, dom, findInputToggles_1, inputBox_1, widget_1, event_1, nls, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HR = void 0;
    const NLS_DEFAULT_LABEL = nls.localize(0, null);
    class $HR extends widget_1.$IP {
        static { this.OPTION_CHANGE = 'optionChange'; }
        constructor(parent, contextViewProvider, options) {
            super();
            this.n = true;
            this.s = false;
            this.w = this.B(new lifecycle_1.$lc());
            this.N = [];
            this.O = this.B(new event_1.$fd());
            this.onDidOptionChange = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onKeyDown = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onMouseDown = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onInput = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onKeyUp = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onCaseSensitiveKeyDown = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onRegexKeyDown = this.W.event;
            this.Y = 0;
            this.a = options.placeholder || '';
            this.b = options.validation;
            this.c = options.label || NLS_DEFAULT_LABEL;
            this.h = !!options.showCommonFindToggles;
            const appendCaseSensitiveLabel = options.appendCaseSensitiveLabel || '';
            const appendWholeWordsLabel = options.appendWholeWordsLabel || '';
            const appendRegexLabel = options.appendRegexLabel || '';
            const history = options.history || [];
            const flexibleHeight = !!options.flexibleHeight;
            const flexibleWidth = !!options.flexibleWidth;
            const flexibleMaxHeight = options.flexibleMaxHeight;
            this.domNode = document.createElement('div');
            this.domNode.classList.add('monaco-findInput');
            this.inputBox = this.B(new inputBox_1.$tR(this.domNode, contextViewProvider, {
                placeholder: this.a || '',
                ariaLabel: this.c || '',
                validationOptions: {
                    validation: this.b
                },
                history,
                showHistoryHint: options.showHistoryHint,
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight,
                inputBoxStyles: options.inputBoxStyles,
            }));
            if (this.h) {
                this.J = this.B(new findInputToggles_1.$GR({
                    appendTitle: appendRegexLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this.B(this.J.onChange(viaKeyboard => {
                    this.O.fire(viaKeyboard);
                    if (!viaKeyboard && this.n) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this.B(this.J.onKeyDown(e => {
                    this.W.fire(e);
                }));
                this.L = this.B(new findInputToggles_1.$FR({
                    appendTitle: appendWholeWordsLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this.B(this.L.onChange(viaKeyboard => {
                    this.O.fire(viaKeyboard);
                    if (!viaKeyboard && this.n) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this.M = this.B(new findInputToggles_1.$ER({
                    appendTitle: appendCaseSensitiveLabel,
                    isChecked: false,
                    ...options.toggleStyles
                }));
                this.B(this.M.onChange(viaKeyboard => {
                    this.O.fire(viaKeyboard);
                    if (!viaKeyboard && this.n) {
                        this.inputBox.focus();
                    }
                    this.validate();
                }));
                this.B(this.M.onKeyDown(e => {
                    this.U.fire(e);
                }));
                // Arrow-Key support to navigate between options
                const indexes = [this.M.domNode, this.L.domNode, this.J.domNode];
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
            }
            this.y = document.createElement('div');
            this.y.className = 'controls';
            this.y.style.display = this.h ? '' : 'none';
            if (this.M) {
                this.y.append(this.M.domNode);
            }
            if (this.L) {
                this.y.appendChild(this.L.domNode);
            }
            if (this.J) {
                this.y.appendChild(this.J.domNode);
            }
            this.setAdditionalToggles(options?.additionalToggles);
            if (this.y) {
                this.domNode.appendChild(this.y);
            }
            parent?.appendChild(this.domNode);
            this.B(dom.$nO(this.inputBox.inputElement, 'compositionstart', (e) => {
                this.s = true;
            }));
            this.B(dom.$nO(this.inputBox.inputElement, 'compositionend', (e) => {
                this.s = false;
                this.R.fire();
            }));
            this.z(this.inputBox.inputElement, (e) => this.P.fire(e));
            this.C(this.inputBox.inputElement, (e) => this.S.fire(e));
            this.D(this.inputBox.inputElement, (e) => this.R.fire());
            this.j(this.inputBox.inputElement, (e) => this.Q.fire(e));
        }
        get isImeSessionInProgress() {
            return this.s;
        }
        get onDidChange() {
            return this.inputBox.onDidChange;
        }
        layout(style) {
            this.inputBox.layout();
            this.X(style.collapsedFindWidget);
        }
        enable() {
            this.domNode.classList.remove('disabled');
            this.inputBox.enable();
            this.J?.enable();
            this.L?.enable();
            this.M?.enable();
            for (const toggle of this.N) {
                toggle.enable();
            }
        }
        disable() {
            this.domNode.classList.add('disabled');
            this.inputBox.disable();
            this.J?.disable();
            this.L?.disable();
            this.M?.disable();
            for (const toggle of this.N) {
                toggle.disable();
            }
        }
        setFocusInputOnOptionClick(value) {
            this.n = value;
        }
        setEnabled(enabled) {
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        setAdditionalToggles(toggles) {
            for (const currentToggle of this.N) {
                currentToggle.domNode.remove();
            }
            this.N = [];
            this.w.value = new lifecycle_1.$jc();
            for (const toggle of toggles ?? []) {
                this.w.value.add(toggle);
                this.y.appendChild(toggle.domNode);
                this.w.value.add(toggle.onChange(viaKeyboard => {
                    this.O.fire(viaKeyboard);
                    if (!viaKeyboard && this.n) {
                        this.inputBox.focus();
                    }
                }));
                this.N.push(toggle);
            }
            if (this.N.length > 0) {
                this.y.style.display = '';
            }
            this.X();
        }
        X(controlsHidden = false) {
            if (controlsHidden) {
                this.inputBox.paddingRight = 0;
            }
            else {
                this.inputBox.paddingRight =
                    ((this.M?.width() ?? 0) + (this.L?.width() ?? 0) + (this.J?.width() ?? 0))
                        + this.N.reduce((r, t) => r + t.width(), 0);
            }
        }
        clear() {
            this.Z();
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
        select() {
            this.inputBox.select();
        }
        focus() {
            this.inputBox.focus();
        }
        getCaseSensitive() {
            return this.M?.checked ?? false;
        }
        setCaseSensitive(value) {
            if (this.M) {
                this.M.checked = value;
            }
        }
        getWholeWords() {
            return this.L?.checked ?? false;
        }
        setWholeWords(value) {
            if (this.L) {
                this.L.checked = value;
            }
        }
        getRegex() {
            return this.J?.checked ?? false;
        }
        setRegex(value) {
            if (this.J) {
                this.J.checked = value;
                this.validate();
            }
        }
        focusOnCaseSensitive() {
            this.M?.focus();
        }
        focusOnRegex() {
            this.J?.focus();
        }
        highlightFindOptions() {
            this.domNode.classList.remove('highlight-' + (this.Y));
            this.Y = 1 - this.Y;
            this.domNode.classList.add('highlight-' + (this.Y));
        }
        validate() {
            this.inputBox.validate();
        }
        showMessage(message) {
            this.inputBox.showMessage(message);
        }
        clearMessage() {
            this.inputBox.hideMessage();
        }
        Z() {
            this.inputBox.hideMessage();
        }
    }
    exports.$HR = $HR;
});
//# sourceMappingURL=findInput.js.map