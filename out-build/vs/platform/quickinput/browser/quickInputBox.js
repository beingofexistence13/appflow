/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/ui/findinput/findInput", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, mouseEvent_1, findInput_1, lifecycle_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yAb = void 0;
    const $ = dom.$;
    class $yAb extends lifecycle_1.$kc {
        constructor(c, inputBoxStyles, toggleStyles) {
            super();
            this.c = c;
            this.onKeyDown = (handler) => {
                return dom.$nO(this.b.inputBox.inputElement, dom.$3O.KEY_DOWN, (e) => {
                    handler(new keyboardEvent_1.$jO(e));
                });
            };
            this.onMouseDown = (handler) => {
                return dom.$nO(this.b.inputBox.inputElement, dom.$3O.MOUSE_DOWN, (e) => {
                    handler(new mouseEvent_1.$eO(e));
                });
            };
            this.onDidChange = (handler) => {
                return this.b.onDidChange(handler);
            };
            this.a = dom.$0O(this.c, $('.quick-input-box'));
            this.b = this.B(new findInput_1.$HR(this.a, undefined, { label: '', inputBoxStyles, toggleStyles }));
            const input = this.b.inputBox.inputElement;
            input.role = 'combobox';
            input.ariaHasPopup = 'menu';
            input.ariaAutoComplete = 'list';
            input.ariaExpanded = 'true';
        }
        get value() {
            return this.b.getValue();
        }
        set value(value) {
            this.b.setValue(value);
        }
        select(range = null) {
            this.b.inputBox.select(range);
        }
        isSelectionAtEnd() {
            return this.b.inputBox.isSelectionAtEnd();
        }
        setPlaceholder(placeholder) {
            this.b.inputBox.setPlaceHolder(placeholder);
        }
        get placeholder() {
            return this.b.inputBox.inputElement.getAttribute('placeholder') || '';
        }
        set placeholder(placeholder) {
            this.b.inputBox.setPlaceHolder(placeholder);
        }
        get password() {
            return this.b.inputBox.inputElement.type === 'password';
        }
        set password(password) {
            this.b.inputBox.inputElement.type = password ? 'password' : 'text';
        }
        set enabled(enabled) {
            // We can't disable the input box because it is still used for
            // navigating the list. Instead, we disable the list and the OK
            // so that nothing can be selected.
            // TODO: should this be what we do for all find inputs? Or maybe some _other_ API
            // on findInput to change it to readonly?
            this.b.inputBox.inputElement.toggleAttribute('readonly', !enabled);
            // TODO: styles of the quick pick need to be moved to the CSS instead of being in line
            // so things like this can be done in CSS
            // this.findInput.inputBox.inputElement.classList.toggle('disabled', !enabled);
        }
        set toggles(toggles) {
            this.b.setAdditionalToggles(toggles);
        }
        hasFocus() {
            return this.b.inputBox.hasFocus();
        }
        setAttribute(name, value) {
            this.b.inputBox.inputElement.setAttribute(name, value);
        }
        removeAttribute(name) {
            this.b.inputBox.inputElement.removeAttribute(name);
        }
        showDecoration(decoration) {
            if (decoration === severity_1.default.Ignore) {
                this.b.clearMessage();
            }
            else {
                this.b.showMessage({ type: decoration === severity_1.default.Info ? 1 /* MessageType.INFO */ : decoration === severity_1.default.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */, content: '' });
            }
        }
        stylesForType(decoration) {
            return this.b.inputBox.stylesForType(decoration === severity_1.default.Info ? 1 /* MessageType.INFO */ : decoration === severity_1.default.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */);
        }
        setFocus() {
            this.b.focus();
        }
        layout() {
            this.b.inputBox.layout();
        }
    }
    exports.$yAb = $yAb;
});
//# sourceMappingURL=quickInputBox.js.map