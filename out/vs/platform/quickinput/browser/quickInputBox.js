/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/ui/findinput/findInput", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, mouseEvent_1, findInput_1, lifecycle_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputBox = void 0;
    const $ = dom.$;
    class QuickInputBox extends lifecycle_1.Disposable {
        constructor(parent, inputBoxStyles, toggleStyles) {
            super();
            this.parent = parent;
            this.onKeyDown = (handler) => {
                return dom.addDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => {
                    handler(new keyboardEvent_1.StandardKeyboardEvent(e));
                });
            };
            this.onMouseDown = (handler) => {
                return dom.addDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.MOUSE_DOWN, (e) => {
                    handler(new mouseEvent_1.StandardMouseEvent(e));
                });
            };
            this.onDidChange = (handler) => {
                return this.findInput.onDidChange(handler);
            };
            this.container = dom.append(this.parent, $('.quick-input-box'));
            this.findInput = this._register(new findInput_1.FindInput(this.container, undefined, { label: '', inputBoxStyles, toggleStyles }));
            const input = this.findInput.inputBox.inputElement;
            input.role = 'combobox';
            input.ariaHasPopup = 'menu';
            input.ariaAutoComplete = 'list';
            input.ariaExpanded = 'true';
        }
        get value() {
            return this.findInput.getValue();
        }
        set value(value) {
            this.findInput.setValue(value);
        }
        select(range = null) {
            this.findInput.inputBox.select(range);
        }
        isSelectionAtEnd() {
            return this.findInput.inputBox.isSelectionAtEnd();
        }
        setPlaceholder(placeholder) {
            this.findInput.inputBox.setPlaceHolder(placeholder);
        }
        get placeholder() {
            return this.findInput.inputBox.inputElement.getAttribute('placeholder') || '';
        }
        set placeholder(placeholder) {
            this.findInput.inputBox.setPlaceHolder(placeholder);
        }
        get password() {
            return this.findInput.inputBox.inputElement.type === 'password';
        }
        set password(password) {
            this.findInput.inputBox.inputElement.type = password ? 'password' : 'text';
        }
        set enabled(enabled) {
            // We can't disable the input box because it is still used for
            // navigating the list. Instead, we disable the list and the OK
            // so that nothing can be selected.
            // TODO: should this be what we do for all find inputs? Or maybe some _other_ API
            // on findInput to change it to readonly?
            this.findInput.inputBox.inputElement.toggleAttribute('readonly', !enabled);
            // TODO: styles of the quick pick need to be moved to the CSS instead of being in line
            // so things like this can be done in CSS
            // this.findInput.inputBox.inputElement.classList.toggle('disabled', !enabled);
        }
        set toggles(toggles) {
            this.findInput.setAdditionalToggles(toggles);
        }
        hasFocus() {
            return this.findInput.inputBox.hasFocus();
        }
        setAttribute(name, value) {
            this.findInput.inputBox.inputElement.setAttribute(name, value);
        }
        removeAttribute(name) {
            this.findInput.inputBox.inputElement.removeAttribute(name);
        }
        showDecoration(decoration) {
            if (decoration === severity_1.default.Ignore) {
                this.findInput.clearMessage();
            }
            else {
                this.findInput.showMessage({ type: decoration === severity_1.default.Info ? 1 /* MessageType.INFO */ : decoration === severity_1.default.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */, content: '' });
            }
        }
        stylesForType(decoration) {
            return this.findInput.inputBox.stylesForType(decoration === severity_1.default.Info ? 1 /* MessageType.INFO */ : decoration === severity_1.default.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */);
        }
        setFocus() {
            this.findInput.focus();
        }
        layout() {
            this.findInput.inputBox.layout();
        }
    }
    exports.QuickInputBox = QuickInputBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dEJveC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3F1aWNraW5wdXQvYnJvd3Nlci9xdWlja0lucHV0Qm94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLE1BQWEsYUFBYyxTQUFRLHNCQUFVO1FBSzVDLFlBQ1MsTUFBbUIsRUFDM0IsY0FBK0IsRUFDL0IsWUFBMkI7WUFFM0IsS0FBSyxFQUFFLENBQUM7WUFKQSxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBYzVCLGNBQVMsR0FBRyxDQUFDLE9BQStDLEVBQWUsRUFBRTtnQkFDNUUsT0FBTyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBZ0IsRUFBRSxFQUFFO29CQUNuSCxPQUFPLENBQUMsSUFBSSxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQztZQUVGLGdCQUFXLEdBQUcsQ0FBQyxPQUE0QyxFQUFlLEVBQUU7Z0JBQzNFLE9BQU8sR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO29CQUNsSCxPQUFPLENBQUMsSUFBSSwrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQztZQUVGLGdCQUFXLEdBQUcsQ0FBQyxPQUFnQyxFQUFlLEVBQUU7Z0JBQy9ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUMsQ0FBQyxDQUFDO1lBdkJELElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2SCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7WUFDbkQsS0FBSyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDeEIsS0FBSyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7WUFDNUIsS0FBSyxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztZQUNoQyxLQUFLLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUM3QixDQUFDO1FBa0JELElBQUksS0FBSztZQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsS0FBYTtZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQXVCLElBQUk7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxnQkFBZ0I7WUFDZixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVELGNBQWMsQ0FBQyxXQUFtQjtZQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0UsQ0FBQztRQUVELElBQUksV0FBVyxDQUFDLFdBQW1CO1lBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztRQUNqRSxDQUFDO1FBRUQsSUFBSSxRQUFRLENBQUMsUUFBaUI7WUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzVFLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFnQjtZQUMzQiw4REFBOEQ7WUFDOUQsK0RBQStEO1lBQy9ELG1DQUFtQztZQUNuQyxpRkFBaUY7WUFDakYseUNBQXlDO1lBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0Usc0ZBQXNGO1lBQ3RGLHlDQUF5QztZQUN6QywrRUFBK0U7UUFDaEYsQ0FBQztRQUVELElBQUksT0FBTyxDQUFDLE9BQTZCO1lBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFRCxZQUFZLENBQUMsSUFBWSxFQUFFLEtBQWE7WUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELGVBQWUsQ0FBQyxJQUFZO1lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELGNBQWMsQ0FBQyxVQUFvQjtZQUNsQyxJQUFJLFVBQVUsS0FBSyxrQkFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUM5QjtpQkFBTTtnQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEtBQUssa0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQywwQkFBa0IsQ0FBQyxDQUFDLFVBQVUsS0FBSyxrQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLDZCQUFxQixDQUFDLDBCQUFrQixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQy9LO1FBQ0YsQ0FBQztRQUVELGFBQWEsQ0FBQyxVQUFvQjtZQUNqQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEtBQUssa0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQywwQkFBa0IsQ0FBQyxDQUFDLFVBQVUsS0FBSyxrQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLDZCQUFxQixDQUFDLDBCQUFrQixDQUFDLENBQUM7UUFDM0ssQ0FBQztRQUVELFFBQVE7WUFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUNEO0lBdkhELHNDQXVIQyJ9