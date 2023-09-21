/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/css!./dialog"], function (require, exports, dom_1, keyboardEvent_1, actionbar_1, button_1, toggle_1, inputBox_1, actions_1, codicons_1, themables_1, labels_1, lifecycle_1, platform_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Dialog = void 0;
    class Dialog extends lifecycle_1.Disposable {
        constructor(container, message, buttons, options) {
            super();
            this.container = container;
            this.message = message;
            this.options = options;
            this.modalElement = this.container.appendChild((0, dom_1.$)(`.monaco-dialog-modal-block.dimmed`));
            this.shadowElement = this.modalElement.appendChild((0, dom_1.$)('.dialog-shadow'));
            this.element = this.shadowElement.appendChild((0, dom_1.$)('.monaco-dialog-box'));
            this.element.setAttribute('role', 'dialog');
            this.element.tabIndex = -1;
            (0, dom_1.hide)(this.element);
            this.buttonStyles = options.buttonStyles;
            if (Array.isArray(buttons) && buttons.length > 0) {
                this.buttons = buttons;
            }
            else if (!this.options.disableDefaultAction) {
                this.buttons = [nls.localize('ok', "OK")];
            }
            else {
                this.buttons = [];
            }
            const buttonsRowElement = this.element.appendChild((0, dom_1.$)('.dialog-buttons-row'));
            this.buttonsContainer = buttonsRowElement.appendChild((0, dom_1.$)('.dialog-buttons'));
            const messageRowElement = this.element.appendChild((0, dom_1.$)('.dialog-message-row'));
            this.iconElement = messageRowElement.appendChild((0, dom_1.$)('#monaco-dialog-icon.dialog-icon'));
            this.iconElement.setAttribute('aria-label', this.getIconAriaLabel());
            this.messageContainer = messageRowElement.appendChild((0, dom_1.$)('.dialog-message-container'));
            if (this.options.detail || this.options.renderBody) {
                const messageElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-message'));
                const messageTextElement = messageElement.appendChild((0, dom_1.$)('#monaco-dialog-message-text.dialog-message-text'));
                messageTextElement.innerText = this.message;
            }
            this.messageDetailElement = this.messageContainer.appendChild((0, dom_1.$)('#monaco-dialog-message-detail.dialog-message-detail'));
            if (this.options.detail || !this.options.renderBody) {
                this.messageDetailElement.innerText = this.options.detail ? this.options.detail : message;
            }
            else {
                this.messageDetailElement.style.display = 'none';
            }
            if (this.options.renderBody) {
                const customBody = this.messageContainer.appendChild((0, dom_1.$)('#monaco-dialog-message-body.dialog-message-body'));
                this.options.renderBody(customBody);
                for (const el of this.messageContainer.querySelectorAll('a')) {
                    el.tabIndex = 0;
                }
            }
            if (this.options.inputs) {
                this.inputs = this.options.inputs.map(input => {
                    const inputRowElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-message-input'));
                    const inputBox = this._register(new inputBox_1.InputBox(inputRowElement, undefined, {
                        placeholder: input.placeholder,
                        type: input.type ?? 'text',
                        inputBoxStyles: options.inputBoxStyles
                    }));
                    if (input.value) {
                        inputBox.value = input.value;
                    }
                    return inputBox;
                });
            }
            else {
                this.inputs = [];
            }
            if (this.options.checkboxLabel) {
                const checkboxRowElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-checkbox-row'));
                const checkbox = this.checkbox = this._register(new toggle_1.Checkbox(this.options.checkboxLabel, !!this.options.checkboxChecked, options.checkboxStyles));
                checkboxRowElement.appendChild(checkbox.domNode);
                const checkboxMessageElement = checkboxRowElement.appendChild((0, dom_1.$)('.dialog-checkbox-message'));
                checkboxMessageElement.innerText = this.options.checkboxLabel;
                this._register((0, dom_1.addDisposableListener)(checkboxMessageElement, dom_1.EventType.CLICK, () => checkbox.checked = !checkbox.checked));
            }
            const toolbarRowElement = this.element.appendChild((0, dom_1.$)('.dialog-toolbar-row'));
            this.toolbarContainer = toolbarRowElement.appendChild((0, dom_1.$)('.dialog-toolbar'));
            this.applyStyles();
        }
        getIconAriaLabel() {
            let typeLabel = nls.localize('dialogInfoMessage', 'Info');
            switch (this.options.type) {
                case 'error':
                    typeLabel = nls.localize('dialogErrorMessage', 'Error');
                    break;
                case 'warning':
                    typeLabel = nls.localize('dialogWarningMessage', 'Warning');
                    break;
                case 'pending':
                    typeLabel = nls.localize('dialogPendingMessage', 'In Progress');
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
            this.messageDetailElement.innerText = message;
        }
        async show() {
            this.focusToReturn = document.activeElement;
            return new Promise((resolve) => {
                (0, dom_1.clearNode)(this.buttonsContainer);
                const buttonBar = this.buttonBar = this._register(new button_1.ButtonBar(this.buttonsContainer));
                const buttonMap = this.rearrangeButtons(this.buttons, this.options.cancelId);
                // Handle button clicks
                buttonMap.forEach((entry, index) => {
                    const primary = buttonMap[index].index === 0;
                    const button = this.options.buttonDetails ? this._register(buttonBar.addButtonWithDescription({ title: true, secondary: !primary, ...this.buttonStyles })) : this._register(buttonBar.addButton({ title: true, secondary: !primary, ...this.buttonStyles }));
                    button.label = (0, labels_1.mnemonicButtonLabel)(buttonMap[index].label, true);
                    if (button instanceof button_1.ButtonWithDescription) {
                        button.description = this.options.buttonDetails[buttonMap[index].index];
                    }
                    this._register(button.onDidClick(e => {
                        if (e) {
                            dom_1.EventHelper.stop(e);
                        }
                        resolve({
                            button: buttonMap[index].index,
                            checkboxChecked: this.checkbox ? this.checkbox.checked : undefined,
                            values: this.inputs.length > 0 ? this.inputs.map(input => input.value) : undefined
                        });
                    }));
                });
                // Handle keyboard events globally: Tab, Arrow-Left/Right
                this._register((0, dom_1.addDisposableListener)(window, 'keydown', e => {
                    const evt = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (evt.equals(512 /* KeyMod.Alt */)) {
                        evt.preventDefault();
                    }
                    if (evt.equals(3 /* KeyCode.Enter */)) {
                        // Enter in input field should OK the dialog
                        if (this.inputs.some(input => input.hasFocus())) {
                            dom_1.EventHelper.stop(e);
                            resolve({
                                button: buttonMap.find(button => button.index !== this.options.cancelId)?.index ?? 0,
                                checkboxChecked: this.checkbox ? this.checkbox.checked : undefined,
                                values: this.inputs.length > 0 ? this.inputs.map(input => input.value) : undefined
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
                        if (this.messageContainer) {
                            const links = this.messageContainer.querySelectorAll('a');
                            for (const link of links) {
                                focusableElements.push(link);
                                if (link === document.activeElement) {
                                    focusedIndex = focusableElements.length - 1;
                                }
                            }
                        }
                        for (const input of this.inputs) {
                            focusableElements.push(input);
                            if (input.hasFocus()) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                        if (this.checkbox) {
                            focusableElements.push(this.checkbox);
                            if (this.checkbox.hasFocus()) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                        if (this.buttonBar) {
                            for (const button of this.buttonBar.buttons) {
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
                        dom_1.EventHelper.stop(e, true);
                    }
                    else if (this.options.keyEventProcessor) {
                        this.options.keyEventProcessor(evt);
                    }
                }, true));
                this._register((0, dom_1.addDisposableListener)(window, 'keyup', e => {
                    dom_1.EventHelper.stop(e, true);
                    const evt = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (!this.options.disableCloseAction && evt.equals(9 /* KeyCode.Escape */)) {
                        resolve({
                            button: this.options.cancelId || 0,
                            checkboxChecked: this.checkbox ? this.checkbox.checked : undefined
                        });
                    }
                }, true));
                // Detect focus out
                this._register((0, dom_1.addDisposableListener)(this.element, 'focusout', e => {
                    if (!!e.relatedTarget && !!this.element) {
                        if (!(0, dom_1.isAncestor)(e.relatedTarget, this.element)) {
                            this.focusToReturn = e.relatedTarget;
                            if (e.target) {
                                e.target.focus();
                                dom_1.EventHelper.stop(e, true);
                            }
                        }
                    }
                }, false));
                const spinModifierClassName = 'codicon-modifier-spin';
                this.iconElement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.dialogError), ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.dialogWarning), ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.dialogInfo), ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.loading), spinModifierClassName);
                if (this.options.icon) {
                    this.iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.options.icon));
                }
                else {
                    switch (this.options.type) {
                        case 'error':
                            this.iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.dialogError));
                            break;
                        case 'warning':
                            this.iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.dialogWarning));
                            break;
                        case 'pending':
                            this.iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.loading), spinModifierClassName);
                            break;
                        case 'none':
                            this.iconElement.classList.add('no-codicon');
                            break;
                        case 'info':
                        case 'question':
                        default:
                            this.iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.dialogInfo));
                            break;
                    }
                }
                if (!this.options.disableCloseAction) {
                    const actionBar = this._register(new actionbar_1.ActionBar(this.toolbarContainer, {}));
                    const action = this._register(new actions_1.Action('dialog.close', nls.localize('dialogClose', "Close Dialog"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.dialogClose), true, async () => {
                        resolve({
                            button: this.options.cancelId || 0,
                            checkboxChecked: this.checkbox ? this.checkbox.checked : undefined
                        });
                    }));
                    actionBar.push(action, { icon: true, label: false });
                }
                this.applyStyles();
                this.element.setAttribute('aria-modal', 'true');
                this.element.setAttribute('aria-labelledby', 'monaco-dialog-icon monaco-dialog-message-text');
                this.element.setAttribute('aria-describedby', 'monaco-dialog-icon monaco-dialog-message-text monaco-dialog-message-detail monaco-dialog-message-body');
                (0, dom_1.show)(this.element);
                // Focus first element (input or button)
                if (this.inputs.length > 0) {
                    this.inputs[0].focus();
                    this.inputs[0].select();
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
        applyStyles() {
            const style = this.options.dialogStyles;
            const fgColor = style.dialogForeground;
            const bgColor = style.dialogBackground;
            const shadowColor = style.dialogShadow ? `0 0px 8px ${style.dialogShadow}` : '';
            const border = style.dialogBorder ? `1px solid ${style.dialogBorder}` : '';
            const linkFgColor = style.textLinkForeground;
            this.shadowElement.style.boxShadow = shadowColor;
            this.element.style.color = fgColor ?? '';
            this.element.style.backgroundColor = bgColor ?? '';
            this.element.style.border = border;
            // TODO fix
            // if (fgColor && bgColor) {
            // 	const messageDetailColor = fgColor.transparent(.9);
            // 	this.messageDetailElement.style.mixBlendMode = messageDetailColor.makeOpaque(bgColor).toString();
            // }
            if (linkFgColor) {
                for (const el of this.messageContainer.getElementsByTagName('a')) {
                    el.style.color = linkFgColor;
                }
            }
            let color;
            switch (this.options.type) {
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
                this.iconElement.style.color = color;
            }
        }
        dispose() {
            super.dispose();
            if (this.modalElement) {
                this.modalElement.remove();
                this.modalElement = undefined;
            }
            if (this.focusToReturn && (0, dom_1.isAncestor)(this.focusToReturn, document.body)) {
                this.focusToReturn.focus();
                this.focusToReturn = undefined;
            }
        }
        rearrangeButtons(buttons, cancelId) {
            // Maps each button to its current label and old index
            // so that when we move them around it's not a problem
            const buttonMap = buttons.map((label, index) => ({ label, index }));
            if (buttons.length < 2) {
                return buttonMap; // only need to rearrange if there are 2+ buttons
            }
            if (platform_1.isMacintosh || platform_1.isLinux) {
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
            else if (platform_1.isWindows) {
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
    exports.Dialog = Dialog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2RpYWxvZy9kaWFsb2cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUVoRyxNQUFhLE1BQU8sU0FBUSxzQkFBVTtRQWdCckMsWUFBb0IsU0FBc0IsRUFBVSxPQUFlLEVBQUUsT0FBNkIsRUFBbUIsT0FBdUI7WUFDM0ksS0FBSyxFQUFFLENBQUM7WUFEVyxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUFrRCxZQUFPLEdBQVAsT0FBTyxDQUFnQjtZQUczSSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUEsT0FBQyxFQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUEsT0FBQyxFQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUEsT0FBQyxFQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBQSxVQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5CLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUV6QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFD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