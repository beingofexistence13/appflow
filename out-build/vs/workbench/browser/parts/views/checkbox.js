/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/browser/ui/toggle/toggle", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/browser/parts/views/checkbox", "vs/platform/theme/browser/defaultStyles"], function (require, exports, DOM, iconLabelHover_1, toggle_1, codicons_1, event_1, lifecycle_1, nls_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6ub = exports.$5ub = void 0;
    class $5ub extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidChangeCheckboxState = this.a.event;
        }
        setCheckboxState(node) {
            this.a.fire([node]);
        }
    }
    exports.$5ub = $5ub;
    class $6ub extends lifecycle_1.$kc {
        static { this.checkboxClass = 'custom-view-tree-node-item-checkbox'; }
        constructor(container, f, g) {
            super();
            this.f = f;
            this.g = g;
            this.isDisposed = false;
            this.c = new event_1.$fd();
            this.onDidChangeState = this.c.event;
            this.a = container;
        }
        render(node) {
            if (node.checkbox) {
                if (!this.toggle) {
                    this.h(node);
                }
                else {
                    this.toggle.checked = node.checkbox.isChecked;
                    this.toggle.setIcon(this.toggle.checked ? codicons_1.$Pj.check : undefined);
                }
            }
        }
        h(node) {
            if (node.checkbox) {
                this.toggle = new toggle_1.$KQ({
                    isChecked: node.checkbox.isChecked,
                    title: '',
                    icon: node.checkbox.isChecked ? codicons_1.$Pj.check : undefined,
                    ...defaultStyles_1.$m2
                });
                this.m(node.checkbox);
                this.s(node.checkbox);
                this.toggle.domNode.classList.add($6ub.checkboxClass);
                this.toggle.domNode.tabIndex = 1;
                DOM.$0O(this.a, this.toggle.domNode);
                this.j(node);
            }
        }
        j(node) {
            if (this.toggle) {
                this.B({ dispose: () => this.t() });
                this.B(this.toggle);
                this.B(this.toggle.onChange(() => {
                    this.n(node);
                }));
            }
        }
        m(checkbox) {
            if (this.toggle) {
                if (!this.b) {
                    this.b = (0, iconLabelHover_1.$ZP)(this.g, this.toggle.domNode, this.r(checkbox));
                    this.B(this.b);
                }
                else {
                    this.b.update(checkbox.tooltip);
                }
            }
        }
        n(node) {
            if (this.toggle && node.checkbox) {
                node.checkbox.isChecked = this.toggle.checked;
                this.toggle.setIcon(this.toggle.checked ? codicons_1.$Pj.check : undefined);
                this.m(node.checkbox);
                this.s(node.checkbox);
                this.f.setCheckboxState(node);
            }
        }
        r(checkbox) {
            return checkbox.tooltip ? checkbox.tooltip :
                checkbox.isChecked ? (0, nls_1.localize)(0, null) : (0, nls_1.localize)(1, null);
        }
        s(checkbox) {
            if (this.toggle && checkbox.accessibilityInformation) {
                this.toggle.domNode.ariaLabel = checkbox.accessibilityInformation.label;
                if (checkbox.accessibilityInformation.role) {
                    this.toggle.domNode.role = checkbox.accessibilityInformation.role;
                }
            }
        }
        t() {
            const children = this.a.children;
            for (const child of children) {
                this.a.removeChild(child);
            }
        }
    }
    exports.$6ub = $6ub;
});
//# sourceMappingURL=checkbox.js.map