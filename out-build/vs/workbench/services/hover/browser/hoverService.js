/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/hover/browser/hover", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/hover/browser/hoverWidget", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/base/browser/keyboardEvent", "vs/platform/accessibility/common/accessibility", "vs/css!./media/hover"], function (require, exports, extensions_1, themeService_1, colorRegistry_1, hover_1, contextView_1, instantiation_1, hoverWidget_1, lifecycle_1, dom_1, keybinding_1, keyboardEvent_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iBb = void 0;
    let $iBb = class $iBb {
        constructor(f, g, contextMenuService, h, i) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            contextMenuService.onDidShowContextMenu(() => this.hideHover());
        }
        showHover(options, focus, skipLastFocusedUpdate) {
            if (getHoverOptionsIdentity(this.a) === getHoverOptionsIdentity(options)) {
                return undefined;
            }
            this.a = options;
            this.c = options;
            const trapFocus = options.trapFocus || this.i.isScreenReaderOptimized();
            // HACK, remove this check when #189076 is fixed
            if (!skipLastFocusedUpdate) {
                if (trapFocus && document.activeElement) {
                    this.d = document.activeElement;
                }
                else {
                    this.d = undefined;
                }
            }
            const hoverDisposables = new lifecycle_1.$jc();
            const hover = this.f.createInstance(hoverWidget_1.$hBb, options);
            hover.onDispose(() => {
                // Required to handle cases such as closing the hover with the escape key
                this.d?.focus();
                // Only clear the current options if it's the current hover, the current options help
                // reduce flickering when the same hover is shown multiple times
                if (this.a === options) {
                    this.a = undefined;
                }
                hoverDisposables.dispose();
            });
            const provider = this.g;
            provider.showContextView(new HoverContextViewDelegate(hover, focus), options.container);
            hover.onRequestLayout(() => provider.layout());
            if ('targetElements' in options.target) {
                for (const element of options.target.targetElements) {
                    hoverDisposables.add((0, dom_1.$nO)(element, dom_1.$3O.CLICK, () => this.hideHover()));
                }
            }
            else {
                hoverDisposables.add((0, dom_1.$nO)(options.target, dom_1.$3O.CLICK, () => this.hideHover()));
            }
            const focusedElement = document.activeElement;
            if (focusedElement) {
                hoverDisposables.add((0, dom_1.$nO)(focusedElement, dom_1.$3O.KEY_DOWN, e => this.k(e, hover, !!options.hideOnKeyDown)));
                hoverDisposables.add((0, dom_1.$nO)(document, dom_1.$3O.KEY_DOWN, e => this.k(e, hover, !!options.hideOnKeyDown)));
                hoverDisposables.add((0, dom_1.$nO)(focusedElement, dom_1.$3O.KEY_UP, e => this.l(e, hover)));
                hoverDisposables.add((0, dom_1.$nO)(document, dom_1.$3O.KEY_UP, e => this.l(e, hover)));
            }
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver(e => this.j(e, hover), { threshold: 0 });
                const firstTargetElement = 'targetElements' in options.target ? options.target.targetElements[0] : options.target;
                observer.observe(firstTargetElement);
                hoverDisposables.add((0, lifecycle_1.$ic)(() => observer.disconnect()));
            }
            this.b = hover;
            return hover;
        }
        hideHover() {
            if (this.b?.isLocked || !this.a) {
                return;
            }
            this.b = undefined;
            this.a = undefined;
            this.g.hideContextView();
        }
        j(entries, hover) {
            const entry = entries[entries.length - 1];
            if (!entry.isIntersecting) {
                hover.dispose();
            }
        }
        showAndFocusLastHover() {
            if (!this.c) {
                return;
            }
            this.showHover(this.c, true, true);
        }
        k(e, hover, hideOnKeyDown) {
            if (e.key === 'Alt') {
                hover.isLocked = true;
                return;
            }
            const event = new keyboardEvent_1.$jO(e);
            const keybinding = this.h.resolveKeyboardEvent(event);
            if (keybinding.getSingleModifierDispatchChords().some(value => !!value) || this.h.softDispatch(event, event.target).kind !== 0 /* ResultKind.NoMatchingKb */) {
                return;
            }
            if (hideOnKeyDown && (!this.a?.trapFocus || e.key !== 'Tab')) {
                this.hideHover();
                this.d?.focus();
            }
        }
        l(e, hover) {
            if (e.key === 'Alt') {
                hover.isLocked = false;
                // Hide if alt is released while the mouse is not over hover/target
                if (!hover.isMouseIn) {
                    this.hideHover();
                    this.d?.focus();
                }
            }
        }
    };
    exports.$iBb = $iBb;
    exports.$iBb = $iBb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, contextView_1.$VZ),
        __param(2, contextView_1.$WZ),
        __param(3, keybinding_1.$2D),
        __param(4, accessibility_1.$1r)
    ], $iBb);
    function getHoverOptionsIdentity(options) {
        if (options === undefined) {
            return undefined;
        }
        return options?.id ?? options;
    }
    class HoverContextViewDelegate {
        get anchorPosition() {
            return this.a.anchor;
        }
        constructor(a, b = false) {
            this.a = a;
            this.b = b;
        }
        render(container) {
            this.a.render(container);
            if (this.b) {
                this.a.focus();
            }
            return this.a;
        }
        getAnchor() {
            return {
                x: this.a.x,
                y: this.a.y
            };
        }
        layout() {
            this.a.layout();
        }
    }
    (0, extensions_1.$mr)(hover_1.$zib, $iBb, 1 /* InstantiationType.Delayed */);
    (0, themeService_1.$mv)((theme, collector) => {
        const hoverBorder = theme.getColor(colorRegistry_1.$5w);
        if (hoverBorder) {
            collector.addRule(`.monaco-workbench .workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-workbench .workbench-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=hoverService.js.map