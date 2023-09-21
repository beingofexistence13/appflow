/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/browser/ui/toggle/toggle", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/theme/browser/defaultStyles"], function (require, exports, DOM, iconLabelHover_1, toggle_1, codicons_1, event_1, lifecycle_1, nls_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreeItemCheckbox = exports.CheckboxStateHandler = void 0;
    class CheckboxStateHandler extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeCheckboxState = this._register(new event_1.Emitter());
            this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
        }
        setCheckboxState(node) {
            this._onDidChangeCheckboxState.fire([node]);
        }
    }
    exports.CheckboxStateHandler = CheckboxStateHandler;
    class TreeItemCheckbox extends lifecycle_1.Disposable {
        static { this.checkboxClass = 'custom-view-tree-node-item-checkbox'; }
        constructor(container, checkboxStateHandler, hoverDelegate) {
            super();
            this.checkboxStateHandler = checkboxStateHandler;
            this.hoverDelegate = hoverDelegate;
            this.isDisposed = false;
            this._onDidChangeState = new event_1.Emitter();
            this.onDidChangeState = this._onDidChangeState.event;
            this.checkboxContainer = container;
        }
        render(node) {
            if (node.checkbox) {
                if (!this.toggle) {
                    this.createCheckbox(node);
                }
                else {
                    this.toggle.checked = node.checkbox.isChecked;
                    this.toggle.setIcon(this.toggle.checked ? codicons_1.Codicon.check : undefined);
                }
            }
        }
        createCheckbox(node) {
            if (node.checkbox) {
                this.toggle = new toggle_1.Toggle({
                    isChecked: node.checkbox.isChecked,
                    title: '',
                    icon: node.checkbox.isChecked ? codicons_1.Codicon.check : undefined,
                    ...defaultStyles_1.defaultToggleStyles
                });
                this.setHover(node.checkbox);
                this.setAccessibilityInformation(node.checkbox);
                this.toggle.domNode.classList.add(TreeItemCheckbox.checkboxClass);
                this.toggle.domNode.tabIndex = 1;
                DOM.append(this.checkboxContainer, this.toggle.domNode);
                this.registerListener(node);
            }
        }
        registerListener(node) {
            if (this.toggle) {
                this._register({ dispose: () => this.removeCheckbox() });
                this._register(this.toggle);
                this._register(this.toggle.onChange(() => {
                    this.setCheckbox(node);
                }));
            }
        }
        setHover(checkbox) {
            if (this.toggle) {
                if (!this.hover) {
                    this.hover = (0, iconLabelHover_1.setupCustomHover)(this.hoverDelegate, this.toggle.domNode, this.checkboxHoverContent(checkbox));
                    this._register(this.hover);
                }
                else {
                    this.hover.update(checkbox.tooltip);
                }
            }
        }
        setCheckbox(node) {
            if (this.toggle && node.checkbox) {
                node.checkbox.isChecked = this.toggle.checked;
                this.toggle.setIcon(this.toggle.checked ? codicons_1.Codicon.check : undefined);
                this.setHover(node.checkbox);
                this.setAccessibilityInformation(node.checkbox);
                this.checkboxStateHandler.setCheckboxState(node);
            }
        }
        checkboxHoverContent(checkbox) {
            return checkbox.tooltip ? checkbox.tooltip :
                checkbox.isChecked ? (0, nls_1.localize)('checked', 'Checked') : (0, nls_1.localize)('unchecked', 'Unchecked');
        }
        setAccessibilityInformation(checkbox) {
            if (this.toggle && checkbox.accessibilityInformation) {
                this.toggle.domNode.ariaLabel = checkbox.accessibilityInformation.label;
                if (checkbox.accessibilityInformation.role) {
                    this.toggle.domNode.role = checkbox.accessibilityInformation.role;
                }
            }
        }
        removeCheckbox() {
            const children = this.checkboxContainer.children;
            for (const child of children) {
                this.checkboxContainer.removeChild(child);
            }
        }
    }
    exports.TreeItemCheckbox = TreeItemCheckbox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy92aWV3cy9jaGVja2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBYSxvQkFBcUIsU0FBUSxzQkFBVTtRQUFwRDs7WUFDa0IsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDL0UsNkJBQXdCLEdBQXVCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUM7UUFLOUYsQ0FBQztRQUhPLGdCQUFnQixDQUFDLElBQWU7WUFDdEMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUNEO0lBUEQsb0RBT0M7SUFFRCxNQUFhLGdCQUFpQixTQUFRLHNCQUFVO2lCQU14QixrQkFBYSxHQUFHLHFDQUFxQyxBQUF4QyxDQUF5QztRQUs3RSxZQUFZLFNBQXNCLEVBQVUsb0JBQTBDLEVBQW1CLGFBQTZCO1lBQ3JJLEtBQUssRUFBRSxDQUFDO1lBRG1DLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFBbUIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBUi9ILGVBQVUsR0FBRyxLQUFLLENBQUM7WUFLVCxzQkFBaUIsR0FBRyxJQUFJLGVBQU8sRUFBVyxDQUFDO1lBQ25ELHFCQUFnQixHQUFtQixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBSXhFLElBQUksQ0FBQyxpQkFBaUIsR0FBbUIsU0FBUyxDQUFDO1FBQ3BELENBQUM7UUFFTSxNQUFNLENBQUMsSUFBZTtZQUM1QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNqQixJ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