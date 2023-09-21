/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/lifecycle", "vs/nls!vs/base/browser/ui/hover/hoverWidget", "vs/css!./hover"], function (require, exports, dom, keyboardEvent_1, scrollableElement_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XP = exports.$WP = exports.$VP = exports.HoverPosition = void 0;
    const $ = dom.$;
    var HoverPosition;
    (function (HoverPosition) {
        HoverPosition[HoverPosition["LEFT"] = 0] = "LEFT";
        HoverPosition[HoverPosition["RIGHT"] = 1] = "RIGHT";
        HoverPosition[HoverPosition["BELOW"] = 2] = "BELOW";
        HoverPosition[HoverPosition["ABOVE"] = 3] = "ABOVE";
    })(HoverPosition || (exports.HoverPosition = HoverPosition = {}));
    class $VP extends lifecycle_1.$kc {
        constructor() {
            super();
            this.containerDomNode = document.createElement('div');
            this.containerDomNode.className = 'monaco-hover';
            this.containerDomNode.tabIndex = 0;
            this.containerDomNode.setAttribute('role', 'tooltip');
            this.contentsDomNode = document.createElement('div');
            this.contentsDomNode.className = 'monaco-hover-content';
            this.scrollbar = this.B(new scrollableElement_1.$UP(this.contentsDomNode, {
                consumeMouseWheelIfScrollbarIsNeeded: true
            }));
            this.containerDomNode.appendChild(this.scrollbar.getDomNode());
        }
        onContentsChanged() {
            this.scrollbar.scanDomNode();
        }
    }
    exports.$VP = $VP;
    class $WP extends lifecycle_1.$kc {
        static render(parent, actionOptions, keybindingLabel) {
            return new $WP(parent, actionOptions, keybindingLabel);
        }
        constructor(parent, actionOptions, keybindingLabel) {
            super();
            this.a = dom.$0O(parent, $('div.action-container'));
            this.a.setAttribute('tabindex', '0');
            this.b = dom.$0O(this.a, $('a.action'));
            this.b.setAttribute('role', 'button');
            if (actionOptions.iconClass) {
                dom.$0O(this.b, $(`span.icon.${actionOptions.iconClass}`));
            }
            const label = dom.$0O(this.b, $('span'));
            label.textContent = keybindingLabel ? `${actionOptions.label} (${keybindingLabel})` : actionOptions.label;
            this.B(dom.$nO(this.a, dom.$3O.CLICK, e => {
                e.stopPropagation();
                e.preventDefault();
                actionOptions.run(this.a);
            }));
            this.B(dom.$nO(this.a, dom.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    e.stopPropagation();
                    e.preventDefault();
                    actionOptions.run(this.a);
                }
            }));
            this.setEnabled(true);
        }
        setEnabled(enabled) {
            if (enabled) {
                this.a.classList.remove('disabled');
                this.a.removeAttribute('aria-disabled');
            }
            else {
                this.a.classList.add('disabled');
                this.a.setAttribute('aria-disabled', 'true');
            }
        }
    }
    exports.$WP = $WP;
    function $XP(shouldHaveHint, keybinding) {
        return shouldHaveHint && keybinding ? (0, nls_1.localize)(0, null, keybinding) : shouldHaveHint ? (0, nls_1.localize)(1, null) : '';
    }
    exports.$XP = $XP;
});
//# sourceMappingURL=hoverWidget.js.map