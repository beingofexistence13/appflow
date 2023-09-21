/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls!vs/editor/contrib/colorPicker/browser/colorPickerWidget", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/css!./colorPicker"], function (require, exports, browser_1, dom, globalPointerMoveMonitor_1, widget_1, codicons_1, color_1, event_1, lifecycle_1, themables_1, nls_1, colorRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$n3 = exports.$m3 = exports.$l3 = exports.$k3 = void 0;
    const $ = dom.$;
    class $k3 extends lifecycle_1.$kc {
        constructor(container, u, themeService, w = false) {
            super();
            this.u = u;
            this.w = w;
            this.n = null;
            this.c = $('.colorpicker-header');
            dom.$0O(container, this.c);
            this.f = dom.$0O(this.c, $('.picked-color'));
            dom.$0O(this.f, $('span.codicon.codicon-color-mode'));
            this.j = dom.$0O(this.f, document.createElement('span'));
            this.j.classList.add('picked-color-presentation');
            const tooltip = (0, nls_1.localize)(0, null);
            this.f.setAttribute('title', tooltip);
            this.m = dom.$0O(this.c, $('.original-color'));
            this.m.style.backgroundColor = color_1.$Os.Format.CSS.format(this.u.originalColor) || '';
            this.t = themeService.getColorTheme().getColor(colorRegistry_1.$3w) || color_1.$Os.white;
            this.B(themeService.onDidColorThemeChange(theme => {
                this.t = theme.getColor(colorRegistry_1.$3w) || color_1.$Os.white;
            }));
            this.B(dom.$nO(this.f, dom.$3O.CLICK, () => this.u.selectNextColorPresentation()));
            this.B(dom.$nO(this.m, dom.$3O.CLICK, () => {
                this.u.color = this.u.originalColor;
                this.u.flushColor();
            }));
            this.B(u.onDidChangeColor(this.y, this));
            this.B(u.onDidChangePresentation(this.z, this));
            this.f.style.backgroundColor = color_1.$Os.Format.CSS.format(u.color) || '';
            this.f.classList.toggle('light', u.color.rgba.a < 0.5 ? this.t.isLighter() : u.color.isLighter());
            this.y(this.u.color);
            // When the color picker widget is a standalone color picker widget, then add a close button
            if (this.w) {
                this.c.classList.add('standalone-colorpicker');
                this.n = this.B(new CloseButton(this.c));
            }
        }
        get domNode() {
            return this.c;
        }
        get closeButton() {
            return this.n;
        }
        get pickedColorNode() {
            return this.f;
        }
        get originalColorNode() {
            return this.m;
        }
        y(color) {
            this.f.style.backgroundColor = color_1.$Os.Format.CSS.format(color) || '';
            this.f.classList.toggle('light', color.rgba.a < 0.5 ? this.t.isLighter() : color.isLighter());
            this.z();
        }
        z() {
            this.j.textContent = this.u.presentation ? this.u.presentation.label : '';
        }
    }
    exports.$k3 = $k3;
    class CloseButton extends lifecycle_1.$kc {
        constructor(container) {
            super();
            this.f = this.B(new event_1.$fd());
            this.onClicked = this.f.event;
            this.c = document.createElement('div');
            this.c.classList.add('close-button');
            dom.$0O(container, this.c);
            const innerDiv = document.createElement('div');
            innerDiv.classList.add('close-button-inner-div');
            dom.$0O(this.c, innerDiv);
            const closeButton = dom.$0O(innerDiv, $('.button' + themables_1.ThemeIcon.asCSSSelector((0, iconRegistry_1.$9u)('color-picker-close', codicons_1.$Pj.close, (0, nls_1.localize)(1, null)))));
            closeButton.classList.add('close-icon');
            this.c.onclick = () => {
                this.f.fire();
            };
        }
    }
    class $l3 extends lifecycle_1.$kc {
        constructor(container, t, u, isStandaloneColorPicker = false) {
            super();
            this.t = t;
            this.u = u;
            this.n = null;
            this.c = $('.colorpicker-body');
            dom.$0O(container, this.c);
            this.f = new SaturationBox(this.c, this.t, this.u);
            this.B(this.f);
            this.B(this.f.onDidChange(this.y, this));
            this.B(this.f.onColorFlushed(this.w, this));
            this.m = new OpacityStrip(this.c, this.t, isStandaloneColorPicker);
            this.B(this.m);
            this.B(this.m.onDidChange(this.z, this));
            this.B(this.m.onColorFlushed(this.w, this));
            this.j = new HueStrip(this.c, this.t, isStandaloneColorPicker);
            this.B(this.j);
            this.B(this.j.onDidChange(this.C, this));
            this.B(this.j.onColorFlushed(this.w, this));
            if (isStandaloneColorPicker) {
                this.n = this.B(new $m3(this.c));
                this.c.classList.add('standalone-colorpicker');
            }
        }
        w() {
            this.t.flushColor();
        }
        y({ s, v }) {
            const hsva = this.t.color.hsva;
            this.t.color = new color_1.$Os(new color_1.$Ns(hsva.h, s, v, hsva.a));
        }
        z(a) {
            const hsva = this.t.color.hsva;
            this.t.color = new color_1.$Os(new color_1.$Ns(hsva.h, hsva.s, hsva.v, a));
        }
        C(value) {
            const hsva = this.t.color.hsva;
            const h = (1 - value) * 360;
            this.t.color = new color_1.$Os(new color_1.$Ns(h === 360 ? 0 : h, hsva.s, hsva.v, hsva.a));
        }
        get domNode() {
            return this.c;
        }
        get saturationBox() {
            return this.f;
        }
        get opacityStrip() {
            return this.m;
        }
        get hueStrip() {
            return this.j;
        }
        get enterButton() {
            return this.n;
        }
        layout() {
            this.f.layout();
            this.m.layout();
            this.j.layout();
        }
    }
    exports.$l3 = $l3;
    class SaturationBox extends lifecycle_1.$kc {
        constructor(container, y, z) {
            super();
            this.y = y;
            this.z = z;
            this.u = new event_1.$fd();
            this.onDidChange = this.u.event;
            this.w = new event_1.$fd();
            this.onColorFlushed = this.w.event;
            this.c = $('.saturation-wrap');
            dom.$0O(container, this.c);
            // Create canvas, draw selected color
            this.j = document.createElement('canvas');
            this.j.className = 'saturation-box';
            dom.$0O(this.c, this.j);
            // Add selection circle
            this.f = $('.saturation-selection');
            dom.$0O(this.c, this.f);
            this.layout();
            this.B(dom.$nO(this.c, dom.$3O.POINTER_DOWN, e => this.C(e)));
            this.B(this.y.onDidChangeColor(this.H, this));
            this.t = null;
        }
        get domNode() {
            return this.c;
        }
        get canvas() {
            return this.j;
        }
        C(e) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            this.t = this.B(new globalPointerMoveMonitor_1.$HP());
            const origin = dom.$FO(this.c);
            if (e.target !== this.f) {
                this.D(e.offsetX, e.offsetY);
            }
            this.t.startMonitoring(e.target, e.pointerId, e.buttons, event => this.D(event.pageX - origin.left, event.pageY - origin.top), () => null);
            const pointerUpListener = dom.$nO(e.target.ownerDocument, dom.$3O.POINTER_UP, () => {
                this.w.fire();
                pointerUpListener.dispose();
                if (this.t) {
                    this.t.stopMonitoring(true);
                    this.t = null;
                }
            }, true);
        }
        D(left, top) {
            const s = Math.max(0, Math.min(1, left / this.m));
            const v = Math.max(0, Math.min(1, 1 - (top / this.n)));
            this.G(s, v);
            this.u.fire({ s, v });
        }
        layout() {
            this.m = this.c.offsetWidth;
            this.n = this.c.offsetHeight;
            this.j.width = this.m * this.z;
            this.j.height = this.n * this.z;
            this.F();
            const hsva = this.y.color.hsva;
            this.G(hsva.s, hsva.v);
        }
        F() {
            const hsva = this.y.color.hsva;
            const saturatedColor = new color_1.$Os(new color_1.$Ns(hsva.h, 1, 1, 1));
            const ctx = this.j.getContext('2d');
            const whiteGradient = ctx.createLinearGradient(0, 0, this.j.width, 0);
            whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            whiteGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            const blackGradient = ctx.createLinearGradient(0, 0, 0, this.j.height);
            blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
            ctx.rect(0, 0, this.j.width, this.j.height);
            ctx.fillStyle = color_1.$Os.Format.CSS.format(saturatedColor);
            ctx.fill();
            ctx.fillStyle = whiteGradient;
            ctx.fill();
            ctx.fillStyle = blackGradient;
            ctx.fill();
        }
        G(s, v) {
            this.f.style.left = `${s * this.m}px`;
            this.f.style.top = `${this.n - v * this.n}px`;
        }
        H(color) {
            if (this.t && this.t.isMonitoring()) {
                return;
            }
            this.F();
            const hsva = color.hsva;
            this.G(hsva.s, hsva.v);
        }
    }
    class Strip extends lifecycle_1.$kc {
        constructor(container, u, showingStandaloneColorPicker = false) {
            super();
            this.u = u;
            this.n = new event_1.$fd();
            this.onDidChange = this.n.event;
            this.t = new event_1.$fd();
            this.onColorFlushed = this.t.event;
            if (showingStandaloneColorPicker) {
                this.c = dom.$0O(container, $('.standalone-strip'));
                this.f = dom.$0O(this.c, $('.standalone-overlay'));
            }
            else {
                this.c = dom.$0O(container, $('.strip'));
                this.f = dom.$0O(this.c, $('.overlay'));
            }
            this.j = dom.$0O(this.c, $('.slider'));
            this.j.style.top = `0px`;
            this.B(dom.$nO(this.c, dom.$3O.POINTER_DOWN, e => this.y(e)));
            this.B(u.onDidChangeColor(this.w, this));
            this.layout();
        }
        layout() {
            this.m = this.c.offsetHeight - this.j.offsetHeight;
            const value = this.D(this.u.color);
            this.C(value);
        }
        w(color) {
            const value = this.D(color);
            this.C(value);
        }
        y(e) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            const monitor = this.B(new globalPointerMoveMonitor_1.$HP());
            const origin = dom.$FO(this.c);
            this.c.classList.add('grabbing');
            if (e.target !== this.j) {
                this.z(e.offsetY);
            }
            monitor.startMonitoring(e.target, e.pointerId, e.buttons, event => this.z(event.pageY - origin.top), () => null);
            const pointerUpListener = dom.$nO(e.target.ownerDocument, dom.$3O.POINTER_UP, () => {
                this.t.fire();
                pointerUpListener.dispose();
                monitor.stopMonitoring(true);
                this.c.classList.remove('grabbing');
            }, true);
        }
        z(top) {
            const value = Math.max(0, Math.min(1, 1 - (top / this.m)));
            this.C(value);
            this.n.fire(value);
        }
        C(value) {
            this.j.style.top = `${(1 - value) * this.m}px`;
        }
    }
    class OpacityStrip extends Strip {
        constructor(container, model, showingStandaloneColorPicker = false) {
            super(container, model, showingStandaloneColorPicker);
            this.c.classList.add('opacity-strip');
            this.w(this.u.color);
        }
        w(color) {
            super.w(color);
            const { r, g, b } = color.rgba;
            const opaque = new color_1.$Os(new color_1.$Ls(r, g, b, 1));
            const transparent = new color_1.$Os(new color_1.$Ls(r, g, b, 0));
            this.f.style.background = `linear-gradient(to bottom, ${opaque} 0%, ${transparent} 100%)`;
        }
        D(color) {
            return color.hsva.a;
        }
    }
    class HueStrip extends Strip {
        constructor(container, model, showingStandaloneColorPicker = false) {
            super(container, model, showingStandaloneColorPicker);
            this.c.classList.add('hue-strip');
        }
        D(color) {
            return 1 - (color.hsva.h / 360);
        }
    }
    class $m3 extends lifecycle_1.$kc {
        constructor(container) {
            super();
            this.f = this.B(new event_1.$fd());
            this.onClicked = this.f.event;
            this.c = dom.$0O(container, document.createElement('button'));
            this.c.classList.add('insert-button');
            this.c.textContent = 'Insert';
            this.c.onclick = e => {
                this.f.fire();
            };
        }
        get button() {
            return this.c;
        }
    }
    exports.$m3 = $m3;
    class $n3 extends widget_1.$IP {
        static { this.c = 'editor.contrib.colorPickerWidget'; }
        constructor(container, model, n, themeService, standaloneColorPicker = false) {
            super();
            this.model = model;
            this.n = n;
            this.B(browser_1.$WN.onDidChange(() => this.layout()));
            const element = $('.colorpicker-widget');
            container.appendChild(element);
            this.header = this.B(new $k3(element, this.model, themeService, standaloneColorPicker));
            this.body = this.B(new $l3(element, this.model, this.n, standaloneColorPicker));
        }
        getId() {
            return $n3.c;
        }
        layout() {
            this.body.layout();
        }
    }
    exports.$n3 = $n3;
});
//# sourceMappingURL=colorPickerWidget.js.map