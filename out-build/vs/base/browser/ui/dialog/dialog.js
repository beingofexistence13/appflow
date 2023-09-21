/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls!vs/base/browser/ui/dialog/dialog", "vs/css!./dialog"], function (require, exports, dom_1, keyboardEvent_1, actionbar_1, button_1, toggle_1, inputBox_1, actions_1, codicons_1, themables_1, labels_1, lifecycle_1, platform_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uR = void 0;
    class $uR extends lifecycle_1.$kc {
        constructor(y, z, buttons, C) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.c = this.y.appendChild((0, dom_1.$)(`.monaco-dialog-modal-block.dimmed`));
            this.b = this.c.appendChild((0, dom_1.$)('.dialog-shadow'));
            this.a = this.b.appendChild((0, dom_1.$)('.monaco-dialog-box'));
            this.a.setAttribute('role', 'dialog');
            this.a.tabIndex = -1;
            (0, dom_1.$eP)(this.a);
            this.w = C.buttonStyles;
            if (Array.isArray(buttons) && buttons.length > 0) {
                this.u = buttons;
            }
            else if (!this.C.disableDefaultAction) {
                this.u = [nls.localize(0, null)];
            }
            else {
                this.u = [];
            }
            const buttonsRowElement = this.a.appendChild((0, dom_1.$)('.dialog-buttons-row'));
            this.f = buttonsRowElement.appendChild((0, dom_1.$)('.dialog-buttons'));
            const messageRowElement = this.a.appendChild((0, dom_1.$)('.dialog-message-row'));
            this.j = messageRowElement.appendChild((0, dom_1.$)('#monaco-dialog-icon.dialog-icon'));
            this.j.setAttribute('aria-label', this.D());
            this.h = messageRowElement.appendChild((0, dom_1.$)('.dialog-message-container'));
            if (this.C.detail || this.C.renderBody) {
                const messageElement = this.h.appendChild((0, dom_1.$)('.dialog-message'));
                const messageTextElement = messageElement.appendChild((0, dom_1.$)('#monaco-dialog-message-text.dialog-message-text'));
                messageTextElement.innerText = this.z;
            }
            this.g = this.h.appendChild((0, dom_1.$)('#monaco-dialog-message-detail.dialog-message-detail'));
            if (this.C.detail || !this.C.renderBody) {
                this.g.innerText = this.C.detail ? this.C.detail : z;
            }
            else {
                this.g.style.display = 'none';
            }
            if (this.C.renderBody) {
                const customBody = this.h.appendChild((0, dom_1.$)('#monaco-dialog-message-body.dialog-message-body'));
                this.C.renderBody(customBody);
                for (const el of this.h.querySelectorAll('a')) {
                    el.tabIndex = 0;
                }
            }
            if (this.C.inputs) {
                this.t = this.C.inputs.map(input => {
                    const inputRowElement = this.h.appendChild((0, dom_1.$)('.dialog-message-input'));
                    const inputBox = this.B(new inputBox_1.$sR(inputRowElement, undefined, {
                        placeholder: input.placeholder,
                        type: input.type ?? 'text',
                        inputBoxStyles: C.inputBoxStyles
                    }));
                    if (input.value) {
                        inputBox.value = input.value;
                    }
                    return inputBox;
                });
            }
            else {
                this.t = [];
            }
            if (this.C.checkboxLabel) {
                const checkboxRowElement = this.h.appendChild((0, dom_1.$)('.dialog-checkbox-row'));
                const checkbox = this.m = this.B(new toggle_1.$LQ(this.C.checkboxLabel, !!this.C.checkboxChecked, C.checkboxStyles));
                checkboxRowElement.appendChild(checkbox.domNode);
                const checkboxMessageElement = checkboxRowElement.appendChild((0, dom_1.$)('.dialog-checkbox-message'));
                checkboxMessageElement.innerText = this.C.checkboxLabel;
                this.B((0, dom_1.$nO)(checkboxMessageElement, dom_1.$3O.CLICK, () => checkbox.checked = !checkbox.checked));
            }
            const toolbarRowElement = this.a.appendChild((0, dom_1.$)('.dialog-toolbar-row'));
            this.n = toolbarRowElement.appendChild((0, dom_1.$)('.dialog-toolbar'));
            this.F();
        }
        D() {
            let typeLabel = nls.localize(1, null);
            switch (this.C.type) {
                case 'error':
                    typeLabel = nls.localize(2, null);
                    break;
                case 'warning':
                    typeLabel = nls.localize(3, null);
                    break;
                case 'pending':
                    typeLabel = nls.localize(4, null);
                    break;
                case 'none':
                case 'info':
                case 'question':
                default:
                    break;
            }
            return typeLabel;
        }
        updateMessage(message) {
            this.g.innerText = message;
        }
        async show() {
            this.s = document.activeElement;
            return new Promise((resolve) => {
                (0, dom_1.$lO)(this.f);
                const buttonBar = this.r = this.B(new button_1.$0Q(this.f));
                const buttonMap = this.G(this.u, this.C.cancelId);
                // Handle button clicks
                buttonMap.forEach((entry, index) => {
                    const primary = buttonMap[index].index === 0;
                    const button = this.C.buttonDetails ? this.B(buttonBar.addButtonWithDescription({ title: true, secondary: !primary, ...this.w })) : this.B(buttonBar.addButton({ title: true, secondary: !primary, ...this.w }));
                    button.label = (0, labels_1.$lA)(buttonMap[index].label, true);
                    if (button instanceof button_1.$9Q) {
                        button.description = this.C.buttonDetails[buttonMap[index].index];
                    }
                    this.B(button.onDidClick(e => {
                        if (e) {
                            dom_1.$5O.stop(e);
                        }
                        resolve({
                            button: buttonMap[index].index,
                            checkboxChecked: this.m ? this.m.checked : undefined,
                            values: this.t.length > 0 ? this.t.map(input => input.value) : undefined
                        });
                    }));
                });
                // Handle keyboard events globally: Tab, Arrow-Left/Right
                this.B((0, dom_1.$nO)(window, 'keydown', e => {
                    const evt = new keyboardEvent_1.$jO(e);
                    if (evt.equals(512 /* KeyMod.Alt */)) {
                        evt.preventDefault();
                    }
                    if (evt.equals(3 /* KeyCode.Enter */)) {
                        // Enter in input field should OK the dialog
                        if (this.t.some(input => input.hasFocus())) {
                            dom_1.$5O.stop(e);
                            resolve({
                                button: buttonMap.find(button => button.index !== this.C.cancelId)?.index ?? 0,
                                checkboxChecked: this.m ? this.m.checked : undefined,
                                values: this.t.length > 0 ? this.t.map(input => input.value) : undefined
                            });
                        }
                        return; // leave default handling
                    }
                    if (evt.equals(10 /* KeyCode.Space */)) {
                        return; // leave default handling
                    }
                    let eventHandled = false;
                    // Focus: Next / Previous
                    if (evt.equals(2 /* KeyCode.Tab */) || evt.equals(17 /* KeyCode.RightArrow */) || evt.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */) || evt.equals(15 /* KeyCode.LeftArrow */)) {
                        // Build a list of focusable elements in their visual order
                        const focusableElements = [];
                        let focusedIndex = -1;
                        if (this.h) {
                            const links = this.h.querySelectorAll('a');
                            for (const link of links) {
                                focusableElements.push(link);
                                if (link === document.activeElement) {
                                    focusedIndex = focusableElements.length - 1;
                                }
                            }
                        }
                        for (const input of this.t) {
                            focusableElements.push(input);
                            if (input.hasFocus()) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                        if (this.m) {
                            focusableElements.push(this.m);
                            if (this.m.hasFocus()) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                        if (this.r) {
                            for (const button of this.r.buttons) {
                                focusableElements.push(button);
                                if (button.hasFocus()) {
                                    focusedIndex = focusableElements.length - 1;
                                }
                            }
                        }
                        // Focus next element (with wrapping)
                        if (evt.equals(2 /* KeyCode.Tab */) || evt.equals(17 /* KeyCode.RightArrow */)) {
                            if (focusedIndex === -1) {
                                focusedIndex = 0; // default to focus first element if none have focus
                            }
                            const newFocusedIndex = (focusedIndex + 1) % focusableElements.length;
                            focusableElements[newFocusedIndex].focus();
                        }
                        // Focus previous element (with wrapping)
                        else {
                            if (focusedIndex === -1) {
                                focusedIndex = focusableElements.length; // default to focus last element if none have focus
                            }
                            let newFocusedIndex = focusedIndex - 1;
                            if (newFocusedIndex === -1) {
                                newFocusedIndex = focusableElements.length - 1;
                            }
                            focusableElements[newFocusedIndex].focus();
                        }
                        eventHandled = true;
                    }
                    if (eventHandled) {
                        dom_1.$5O.stop(e, true);
                    }
                    else if (this.C.keyEventProcessor) {
                        this.C.keyEventProcessor(evt);
                    }
                }, true));
                this.B((0, dom_1.$nO)(window, 'keyup', e => {
                    dom_1.$5O.stop(e, true);
                    const evt = new keyboardEvent_1.$jO(e);
                    if (!this.C.disableCloseAction && evt.equals(9 /* KeyCode.Escape */)) {
                        resolve({
                            button: this.C.cancelId || 0,
                            checkboxChecked: this.m ? this.m.checked : undefined
                        });
                    }
                }, true));
                // Detect focus out
                this.B((0, dom_1.$nO)(this.a, 'focusout', e => {
                    if (!!e.relatedTarget && !!this.a) {
                        if (!(0, dom_1.$NO)(e.relatedTarget, this.a)) {
                            this.s = e.relatedTarget;
                            if (e.target) {
                                e.target.focus();
                                dom_1.$5O.stop(e, true);
                            }
                        }
                    }
                }, false));
                const spinModifierClassName = 'codicon-modifier-spin';
                this.j.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.dialogError), ...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.dialogWarning), ...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.dialogInfo), ...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.loading), spinModifierClassName);
                if (this.C.icon) {
                    this.j.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.C.icon));
                }
                else {
                    switch (this.C.type) {
                        case 'error':
                            this.j.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.dialogError));
                            break;
                        case 'warning':
                            this.j.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.dialogWarning));
                            break;
                        case 'pending':
                            this.j.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.loading), spinModifierClassName);
                            break;
                        case 'none':
                            this.j.classList.add('no-codicon');
                            break;
                        case 'info':
                        case 'question':
                        default:
                            this.j.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.dialogInfo));
                            break;
                    }
                }
                if (!this.C.disableCloseAction) {
                    const actionBar = this.B(new actionbar_1.$1P(this.n, {}));
                    const action = this.B(new actions_1.$gi('dialog.close', nls.localize(5, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.dialogClose), true, async () => {
                        resolve({
                            button: this.C.cancelId || 0,
                            checkboxChecked: this.m ? this.m.checked : undefined
                        });
                    }));
                    actionBar.push(action, { icon: true, label: false });
                }
                this.F();
                this.a.setAttribute('aria-modal', 'true');
                this.a.setAttribute('aria-labelledby', 'monaco-dialog-icon monaco-dialog-message-text');
                this.a.setAttribute('aria-describedby', 'monaco-dialog-icon monaco-dialog-message-text monaco-dialog-message-detail monaco-dialog-message-body');
                (0, dom_1.$dP)(this.a);
                // Focus first element (input or button)
                if (this.t.length > 0) {
                    this.t[0].focus();
                    this.t[0].select();
                }
                else {
                    buttonMap.forEach((value, index) => {
                        if (value.index === 0) {
                            buttonBar.buttons[index].focus();
                        }
                    });
                }
            });
        }
        F() {
            const style = this.C.dialogStyles;
            const fgColor = style.dialogForeground;
            const bgColor = style.dialogBackground;
            const shadowColor = style.dialogShadow ? `0 0px 8px ${style.dialogShadow}` : '';
            const border = style.dialogBorder ? `1px solid ${style.dialogBorder}` : '';
            const linkFgColor = style.textLinkForeground;
            this.b.style.boxShadow = shadowColor;
            this.a.style.color = fgColor ?? '';
            this.a.style.backgroundColor = bgColor ?? '';
            this.a.style.border = border;
            // TODO fix
            // if (fgColor && bgColor) {
            // 	const messageDetailColor = fgColor.transparent(.9);
            // 	this.messageDetailElement.style.mixBlendMode = messageDetailColor.makeOpaque(bgColor).toString();
            // }
            if (linkFgColor) {
                for (const el of this.h.getElementsByTagName('a')) {
                    el.style.color = linkFgColor;
                }
            }
            let color;
            switch (this.C.type) {
                case 'error':
                    color = style.errorIconForeground;
                    break;
                case 'warning':
                    color = style.warningIconForeground;
                    break;
                default:
                    color = style.infoIconForeground;
                    break;
            }
            if (color) {
                this.j.style.color = color;
            }
        }
        dispose() {
            super.dispose();
            if (this.c) {
                this.c.remove();
                this.c = undefined;
            }
            if (this.s && (0, dom_1.$NO)(this.s, document.body)) {
                this.s.focus();
                this.s = undefined;
            }
        }
        G(buttons, cancelId) {
            // Maps each button to its current label and old index
            // so that when we move them around it's not a problem
            const buttonMap = buttons.map((label, index) => ({ label, index }));
            if (buttons.length < 2) {
                return buttonMap; // only need to rearrange if there are 2+ buttons
            }
            if (platform_1.$j || platform_1.$k) {
                // Linux: the GNOME HIG (https://developer.gnome.org/hig/patterns/feedback/dialogs.html?highlight=dialog)
                // recommend the following:
                // "Always ensure that the cancel button appears first, before the affirmative button. In left-to-right
                //  locales, this is on the left. This button order ensures that users become aware of, and are reminded
                //  of, the ability to cancel prior to encountering the affirmative button."
                // macOS: the HIG (https://developer.apple.com/design/human-interface-guidelines/components/presentation/alerts)
                // recommend the following:
                // "Place buttons where people expect. In general, place the button people are most likely to choose on the trailing side in a
                //  row of buttons or at the top in a stack of buttons. Always place the default button on the trailing side of a row or at the
                //  top of a stack. Cancel buttons are typically on the leading side of a row or at the bottom of a stack."
                if (typeof cancelId === 'number' && buttonMap[cancelId]) {
                    const cancelButton = buttonMap.splice(cancelId, 1)[0];
                    buttonMap.splice(1, 0, cancelButton);
                }
                buttonMap.reverse();
            }
            else if (platform_1.$i) {
                // Windows: the HIG (https://learn.microsoft.com/en-us/windows/win32/uxguide/win-dialog-box)
                // recommend the following:
                // "One of the following sets of concise commands: Yes/No, Yes/No/Cancel, [Do it]/Cancel,
                //  [Do it]/[Don't do it], [Do it]/[Don't do it]/Cancel."
                if (typeof cancelId === 'number' && buttonMap[cancelId]) {
                    const cancelButton = buttonMap.splice(cancelId, 1)[0];
                    buttonMap.push(cancelButton);
                }
            }
            return buttonMap;
        }
    }
    exports.$uR = $uR;
});
//# sourceMappingURL=dialog.js.map