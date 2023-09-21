/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/menu/menu", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom_1, mouseEvent_1, menu_1, actions_1, errors_1, lifecycle_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$A4b = void 0;
    class $A4b {
        constructor(g, h, i, j) {
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.a = null;
            this.b = null;
            this.c = null;
            this.d = null;
            this.f = { blockMouse: true };
        }
        configure(options) {
            this.f = options;
        }
        showContextMenu(delegate) {
            const actions = delegate.getActions();
            if (!actions.length) {
                return; // Don't render an empty context menu
            }
            this.a = document.activeElement;
            let menu;
            const shadowRootElement = (0, dom_1.$2O)(delegate.domForShadowRoot) ? delegate.domForShadowRoot : undefined;
            this.g.showContextView({
                getAnchor: () => delegate.getAnchor(),
                canRelayout: false,
                anchorAlignment: delegate.anchorAlignment,
                anchorAxisAlignment: delegate.anchorAxisAlignment,
                render: (container) => {
                    this.b = container;
                    const className = delegate.getMenuClassName ? delegate.getMenuClassName() : '';
                    if (className) {
                        container.className += ' ' + className;
                    }
                    // Render invisible div to block mouse interaction in the rest of the UI
                    if (this.f.blockMouse) {
                        this.c = container.appendChild((0, dom_1.$)('.context-view-block'));
                        this.c.style.position = 'fixed';
                        this.c.style.cursor = 'initial';
                        this.c.style.left = '0';
                        this.c.style.top = '0';
                        this.c.style.width = '100%';
                        this.c.style.height = '100%';
                        this.c.style.zIndex = '-1';
                        this.d?.dispose();
                        this.d = (0, dom_1.$nO)(this.c, dom_1.$3O.MOUSE_DOWN, e => e.stopPropagation());
                    }
                    const menuDisposables = new lifecycle_1.$jc();
                    const actionRunner = delegate.actionRunner || new actions_1.$hi();
                    actionRunner.onWillRun(evt => this.k(evt, !delegate.skipTelemetry), this, menuDisposables);
                    actionRunner.onDidRun(this.l, this, menuDisposables);
                    menu = new menu_1.$yR(container, actions, {
                        actionViewItemProvider: delegate.getActionViewItem,
                        context: delegate.getActionsContext ? delegate.getActionsContext() : null,
                        actionRunner,
                        getKeyBinding: delegate.getKeyBinding ? delegate.getKeyBinding : action => this.j.lookupKeybinding(action.id)
                    }, defaultStyles_1.$D2);
                    menu.onDidCancel(() => this.g.hideContextView(true), null, menuDisposables);
                    menu.onDidBlur(() => this.g.hideContextView(true), null, menuDisposables);
                    menuDisposables.add((0, dom_1.$nO)(window, dom_1.$3O.BLUR, () => this.g.hideContextView(true)));
                    menuDisposables.add((0, dom_1.$nO)(window, dom_1.$3O.MOUSE_DOWN, (e) => {
                        if (e.defaultPrevented) {
                            return;
                        }
                        const event = new mouseEvent_1.$eO(e);
                        let element = event.target;
                        // Don't do anything as we are likely creating a context menu
                        if (event.rightButton) {
                            return;
                        }
                        while (element) {
                            if (element === container) {
                                return;
                            }
                            element = element.parentElement;
                        }
                        this.g.hideContextView(true);
                    }));
                    return (0, lifecycle_1.$hc)(menuDisposables, menu);
                },
                focus: () => {
                    menu?.focus(!!delegate.autoSelectFirstItem);
                },
                onHide: (didCancel) => {
                    delegate.onHide?.(!!didCancel);
                    if (this.c) {
                        this.c.remove();
                        this.c = null;
                    }
                    this.d?.dispose();
                    this.d = null;
                    if (!!this.b && ((0, dom_1.$VO)() === this.b || (0, dom_1.$NO)((0, dom_1.$VO)(), this.b))) {
                        this.a?.focus();
                    }
                    this.b = null;
                }
            }, shadowRootElement, !!shadowRootElement);
        }
        k(e, logTelemetry) {
            if (logTelemetry) {
                this.h.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'contextMenu' });
            }
            this.g.hideContextView(false);
        }
        l(e) {
            if (e.error && !(0, errors_1.$2)(e.error)) {
                this.i.error(e.error);
            }
        }
    }
    exports.$A4b = $A4b;
});
//# sourceMappingURL=contextMenuHandler.js.map