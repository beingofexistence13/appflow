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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/common/async", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/base/common/platform", "vs/base/common/event", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, dom, async_1, terminalLinkHelpers_1, platform_1, event_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JWb = void 0;
    let $JWb = class $JWb extends lifecycle_1.$jc {
        get onInvalidated() { return this.c.event; }
        get type() { return this.r; }
        constructor(h, range, text, actions, j, m, n, q, label, r, s) {
            super();
            this.h = h;
            this.range = range;
            this.text = text;
            this.actions = actions;
            this.j = j;
            this.m = m;
            this.n = n;
            this.q = q;
            this.label = label;
            this.r = r;
            this.s = s;
            this.c = new event_1.$fd();
            this.decorations = {
                pointerCursor: false,
                underline: this.q
            };
        }
        dispose() {
            super.dispose();
            this.b?.dispose();
            this.b = undefined;
            this.a?.dispose();
            this.a = undefined;
        }
        activate(event, text) {
            // Trigger the xterm.js callback synchronously but track the promise resolution so we can
            // use it in tests
            this.asyncActivate = this.m(event, text);
        }
        hover(event, text) {
            // Listen for modifier before handing it off to the hover to handle so it gets disposed correctly
            this.b = new lifecycle_1.$jc();
            this.b.add(dom.$nO(document, 'keydown', e => {
                if (!e.repeat && this.w(e)) {
                    this.t();
                }
            }));
            this.b.add(dom.$nO(document, 'keyup', e => {
                if (!e.repeat && !this.w(e)) {
                    this.u();
                }
            }));
            // Listen for when the terminal renders on the same line as the link
            this.b.add(this.h.onRender(e => {
                const viewportRangeY = this.range.start.y - this.j;
                if (viewportRangeY >= e.start && viewportRangeY <= e.end) {
                    this.c.fire();
                }
            }));
            // Only show the tooltip and highlight for high confidence links (not word/search workspace
            // links). Feedback was that this makes using the terminal overly noisy.
            if (this.q) {
                this.a = new async_1.$Sg(() => {
                    this.n(this, (0, terminalLinkHelpers_1.$DWb)(this.range, this.j), this.q ? () => this.t() : undefined, this.q ? () => this.u() : undefined);
                    // Clear out scheduler until next hover event
                    this.a?.dispose();
                    this.a = undefined;
                }, this.s.getValue('workbench.hover.delay'));
                this.add(this.a);
                this.a.schedule();
            }
            const origin = { x: event.pageX, y: event.pageY };
            this.b.add(dom.$nO(document, dom.$3O.MOUSE_MOVE, e => {
                // Update decorations
                if (this.w(e)) {
                    this.t();
                }
                else {
                    this.u();
                }
                // Reset the scheduler if the mouse moves too much
                if (Math.abs(e.pageX - origin.x) > window.devicePixelRatio * 2 || Math.abs(e.pageY - origin.y) > window.devicePixelRatio * 2) {
                    origin.x = e.pageX;
                    origin.y = e.pageY;
                    this.a?.schedule();
                }
            }));
        }
        leave() {
            this.b?.dispose();
            this.b = undefined;
            this.a?.dispose();
            this.a = undefined;
        }
        t() {
            if (!this.decorations.pointerCursor) {
                this.decorations.pointerCursor = true;
            }
            if (!this.decorations.underline) {
                this.decorations.underline = true;
            }
        }
        u() {
            if (this.decorations.pointerCursor) {
                this.decorations.pointerCursor = false;
            }
            if (this.decorations.underline !== this.q) {
                this.decorations.underline = this.q;
            }
        }
        w(event) {
            const multiCursorModifier = this.s.getValue('editor.multiCursorModifier');
            if (multiCursorModifier === 'ctrlCmd') {
                return !!event.altKey;
            }
            return platform_1.$j ? event.metaKey : event.ctrlKey;
        }
    };
    exports.$JWb = $JWb;
    exports.$JWb = $JWb = __decorate([
        __param(10, configuration_1.$8h)
    ], $JWb);
});
//# sourceMappingURL=terminalLink.js.map