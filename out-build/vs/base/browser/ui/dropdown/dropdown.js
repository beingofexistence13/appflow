/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/common/actions", "vs/base/common/event", "vs/css!./dropdown"], function (require, exports, dom_1, keyboardEvent_1, touch_1, actions_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BR = void 0;
    class BaseDropdown extends actions_1.$hi {
        constructor(container, options) {
            super();
            this.j = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.j.event;
            this.a = (0, dom_1.$0O)(container, (0, dom_1.$)('.monaco-dropdown'));
            this.c = (0, dom_1.$0O)(this.a, (0, dom_1.$)('.dropdown-label'));
            let labelRenderer = options.labelRenderer;
            if (!labelRenderer) {
                labelRenderer = (container) => {
                    container.textContent = options.label || '';
                    return null;
                };
            }
            for (const event of [dom_1.$3O.CLICK, dom_1.$3O.MOUSE_DOWN, touch_1.EventType.Tap]) {
                this.B((0, dom_1.$nO)(this.element, event, e => dom_1.$5O.stop(e, true))); // prevent default click behaviour to trigger
            }
            for (const event of [dom_1.$3O.MOUSE_DOWN, touch_1.EventType.Tap]) {
                this.B((0, dom_1.$nO)(this.c, event, e => {
                    if (e instanceof MouseEvent && (e.detail > 1 || e.button !== 0)) {
                        // prevent right click trigger to allow separate context menu (https://github.com/microsoft/vscode/issues/151064)
                        // prevent multiple clicks to open multiple context menus (https://github.com/microsoft/vscode/issues/41363)
                        return;
                    }
                    if (this.h) {
                        this.hide();
                    }
                    else {
                        this.show();
                    }
                }));
            }
            this.B((0, dom_1.$nO)(this.c, dom_1.$3O.KEY_UP, e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    dom_1.$5O.stop(e, true); // https://github.com/microsoft/vscode/issues/57997
                    if (this.h) {
                        this.hide();
                    }
                    else {
                        this.show();
                    }
                }
            }));
            const cleanupFn = labelRenderer(this.c);
            if (cleanupFn) {
                this.B(cleanupFn);
            }
            this.B(touch_1.$EP.addTarget(this.c));
        }
        get element() {
            return this.a;
        }
        get label() {
            return this.c;
        }
        set tooltip(tooltip) {
            if (this.c) {
                this.c.title = tooltip;
            }
        }
        show() {
            if (!this.h) {
                this.h = true;
                this.j.fire(true);
            }
        }
        hide() {
            if (this.h) {
                this.h = false;
                this.j.fire(false);
            }
        }
        isVisible() {
            return !!this.h;
        }
        n(_e, activeElement) {
            this.hide();
        }
        dispose() {
            super.dispose();
            this.hide();
            if (this.b) {
                this.b.remove();
                this.b = undefined;
            }
            if (this.g) {
                this.g.remove();
                this.g = undefined;
            }
            if (this.c) {
                this.c.remove();
                this.c = undefined;
            }
        }
    }
    class $BR extends BaseDropdown {
        constructor(container, t) {
            super(container, t);
            this.t = t;
            this.s = [];
            this.w = t.actions || [];
        }
        set menuOptions(options) {
            this.r = options;
        }
        get menuOptions() {
            return this.r;
        }
        get w() {
            if (this.t.actionProvider) {
                return this.t.actionProvider.getActions();
            }
            return this.s;
        }
        set w(actions) {
            this.s = actions;
        }
        show() {
            super.show();
            this.element.classList.add('active');
            this.t.contextMenuProvider.showContextMenu({
                getAnchor: () => this.element,
                getActions: () => this.w,
                getActionsContext: () => this.menuOptions ? this.menuOptions.context : null,
                getActionViewItem: (action, options) => this.menuOptions && this.menuOptions.actionViewItemProvider ? this.menuOptions.actionViewItemProvider(action, options) : undefined,
                getKeyBinding: action => this.menuOptions && this.menuOptions.getKeyBinding ? this.menuOptions.getKeyBinding(action) : undefined,
                getMenuClassName: () => this.t.menuClassName || '',
                onHide: () => this.y(),
                actionRunner: this.menuOptions ? this.menuOptions.actionRunner : undefined,
                anchorAlignment: this.menuOptions ? this.menuOptions.anchorAlignment : 0 /* AnchorAlignment.LEFT */,
                domForShadowRoot: this.t.menuAsChild ? this.element : undefined,
                skipTelemetry: this.t.skipTelemetry
            });
        }
        hide() {
            super.hide();
        }
        y() {
            this.hide();
            this.element.classList.remove('active');
        }
    }
    exports.$BR = $BR;
});
//# sourceMappingURL=dropdown.js.map