/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/css!./colorPicker"], function (require, exports, browser_1, dom, globalPointerMoveMonitor_1, widget_1, codicons_1, color_1, event_1, lifecycle_1, themables_1, nls_1, colorRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorPickerWidget = exports.InsertButton = exports.ColorPickerBody = exports.ColorPickerHeader = void 0;
    const $ = dom.$;
    class ColorPickerHeader extends lifecycle_1.Disposable {
        constructor(container, model, themeService, showingStandaloneColorPicker = false) {
            super();
            this.model = model;
            this.showingStandaloneColorPicker = showingStandaloneColorPicker;
            this._closeButton = null;
            this._domNode = $('.colorpicker-header');
            dom.append(container, this._domNode);
            this._pickedColorNode = dom.append(this._domNode, $('.picked-color'));
            dom.append(this._pickedColorNode, $('span.codicon.codicon-color-mode'));
            this._pickedColorPresentation = dom.append(this._pickedColorNode, document.createElement('span'));
            this._pickedColorPresentation.classList.add('picked-color-presentation');
            const tooltip = (0, nls_1.localize)('clickToToggleColorOptions', "Click to toggle color options (rgb/hsl/hex)");
            this._pickedColorNode.setAttribute('title', tooltip);
            this._originalColorNode = dom.append(this._domNode, $('.original-color'));
            this._originalColorNode.style.backgroundColor = color_1.Color.Format.CSS.format(this.model.originalColor) || '';
            this.backgroundColor = themeService.getColorTheme().getColor(colorRegistry_1.editorHoverBackground) || color_1.Color.white;
            this._register(themeService.onDidColorThemeChange(theme => {
                this.backgroundColor = theme.getColor(colorRegistry_1.editorHoverBackground) || color_1.Color.white;
            }));
            this._register(dom.addDisposableListener(this._pickedColorNode, dom.EventType.CLICK, () => this.model.selectNextColorPresentation()));
            this._register(dom.addDisposableListener(this._originalColorNode, dom.EventType.CLICK, () => {
                this.model.color = this.model.originalColor;
                this.model.flushColor();
            }));
            this._register(model.onDidChangeColor(this.onDidChangeColor, this));
            this._register(model.onDidChangePresentation(this.onDidChangePresentation, this));
            this._pickedColorNode.style.backgroundColor = color_1.Color.Format.CSS.format(model.color) || '';
            this._pickedColorNode.classList.toggle('light', model.color.rgba.a < 0.5 ? this.backgroundColor.isLighter() : model.color.isLighter());
            this.onDidChangeColor(this.model.color);
            // When the color picker widget is a standalone color picker widget, then add a close button
            if (this.showingStandaloneColorPicker) {
                this._domNode.classList.add('standalone-colorpicker');
                this._closeButton = this._register(new CloseButton(this._domNode));
            }
        }
        get domNode() {
            return this._domNode;
        }
        get closeButton() {
            return this._closeButton;
        }
        get pickedColorNode() {
            return this._pickedColorNode;
        }
        get originalColorNode() {
            return this._originalColorNode;
        }
        onDidChangeColor(color) {
            this._pickedColorNode.style.backgroundColor = color_1.Color.Format.CSS.format(color) || '';
            this._pickedColorNode.classList.toggle('light', color.rgba.a < 0.5 ? this.backgroundColor.isLighter() : color.isLighter());
            this.onDidChangePresentation();
        }
        onDidChangePresentation() {
            this._pickedColorPresentation.textContent = this.model.presentation ? this.model.presentation.label : '';
        }
    }
    exports.ColorPickerHeader = ColorPickerHeader;
    class CloseButton extends lifecycle_1.Disposable {
        constructor(container) {
            super();
            this._onClicked = this._register(new event_1.Emitter());
            this.onClicked = this._onClicked.event;
            this._button = document.createElement('div');
            this._button.classList.add('close-button');
            dom.append(container, this._button);
            const innerDiv = document.createElement('div');
            innerDiv.classList.add('close-button-inner-div');
            dom.append(this._button, innerDiv);
            const closeButton = dom.append(innerDiv, $('.button' + themables_1.ThemeIcon.asCSSSelector((0, iconRegistry_1.registerIcon)('color-picker-close', codicons_1.Codicon.close, (0, nls_1.localize)('closeIcon', 'Icon to close the color picker')))));
            closeButton.classList.add('close-icon');
            this._button.onclick = () => {
                this._onClicked.fire();
            };
        }
    }
    class ColorPickerBody extends lifecycle_1.Disposable {
        constructor(container, model, pixelRatio, isStandaloneColorPicker = false) {
            super();
            this.model = model;
            this.pixelRatio = pixelRatio;
            this._insertButton = null;
            this._domNode = $('.colorpicker-body');
            dom.append(container, this._domNode);
            this._saturationBox = new SaturationBox(this._domNode, this.model, this.pixelRatio);
            this._register(this._saturationBox);
            this._register(this._saturationBox.onDidChange(this.onDidSaturationValueChange, this));
            this._register(this._saturationBox.onColorFlushed(this.flushColor, this));
            this._opacityStrip = new OpacityStrip(this._domNode, this.model, isStandaloneColorPicker);
            this._register(this._opacityStrip);
            this._register(this._opacityStrip.onDidChange(this.onDidOpacityChange, this));
            this._register(this._opacityStrip.onColorFlushed(this.flushColor, this));
            this._hueStrip = new HueStrip(this._domNode, this.model, isStandaloneColorPicker);
            this._register(this._hueStrip);
            this._register(this._hueStrip.onDidChange(this.onDidHueChange, this));
            this._register(this._hueStrip.onColorFlushed(this.flushColor, this));
            if (isStandaloneColorPicker) {
                this._insertButton = this._register(new InsertButton(this._domNode));
                this._domNode.classList.add('standalone-colorpicker');
            }
        }
        flushColor() {
            this.model.flushColor();
        }
        onDidSaturationValueChange({ s, v }) {
            const hsva = this.model.color.hsva;
            this.model.color = new color_1.Color(new color_1.HSVA(hsva.h, s, v, hsva.a));
        }
        onDidOpacityChange(a) {
            const hsva = this.model.color.hsva;
            this.model.color = new color_1.Color(new color_1.HSVA(hsva.h, hsva.s, hsva.v, a));
        }
        onDidHueChange(value) {
            const hsva = this.model.color.hsva;
            const h = (1 - value) * 360;
            this.model.color = new color_1.Color(new color_1.HSVA(h === 360 ? 0 : h, hsva.s, hsva.v, hsva.a));
        }
        get domNode() {
            return this._domNode;
        }
        get saturationBox() {
            return this._saturationBox;
        }
        get opacityStrip() {
            return this._opacityStrip;
        }
        get hueStrip() {
            return this._hueStrip;
        }
        get enterButton() {
            return this._insertButton;
        }
        layout() {
            this._saturationBox.layout();
            this._opacityStrip.layout();
            this._hueStrip.layout();
        }
    }
    exports.ColorPickerBody = ColorPickerBody;
    class SaturationBox extends lifecycle_1.Disposable {
        constructor(container, model, pixelRatio) {
            super();
            this.model = model;
            this.pixelRatio = pixelRatio;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._onColorFlushed = new event_1.Emitter();
            this.onColorFlushed = this._onColorFlushed.event;
            this._domNode = $('.saturation-wrap');
            dom.append(container, this._domNode);
            // Create canvas, draw selected color
            this._canvas = document.createElement('canvas');
            this._canvas.className = 'saturation-box';
            dom.append(this._domNode, this._canvas);
            // Add selection circle
            this.selection = $('.saturation-selection');
            dom.append(this._domNode, this.selection);
            this.layout();
            this._register(dom.addDisposableListener(this._domNode, dom.EventType.POINTER_DOWN, e => this.onPointerDown(e)));
            this._register(this.model.onDidChangeColor(this.onDidChangeColor, this));
            this.monitor = null;
        }
        get domNode() {
            return this._domNode;
        }
        get canvas() {
            return this._canvas;
        }
        onPointerDown(e) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            this.monitor = this._register(new globalPointerMoveMonitor_1.GlobalPointerMoveMonitor());
            const origin = dom.getDomNodePagePosition(this._domNode);
            if (e.target !== this.selection) {
                this.onDidChangePosition(e.offsetX, e.offsetY);
            }
            this.monitor.startMonitoring(e.target, e.pointerId, e.buttons, event => this.onDidChangePosition(event.pageX - origin.left, event.pageY - origin.top), () => null);
            const pointerUpListener = dom.addDisposableListener(e.target.ownerDocument, dom.EventType.POINTER_UP, () => {
                this._onColorFlushed.fire();
                pointerUpListener.dispose();
                if (this.monitor) {
                    this.monitor.stopMonitoring(true);
                    this.monitor = null;
                }
            }, true);
        }
        onDidChangePosition(left, top) {
            const s = Math.max(0, Math.min(1, left / this.width));
            const v = Math.max(0, Math.min(1, 1 - (top / this.height)));
            this.paintSelection(s, v);
            this._onDidChange.fire({ s, v });
        }
        layout() {
            this.width = this._domNode.offsetWidth;
            this.height = this._domNode.offsetHeight;
            this._canvas.width = this.width * this.pixelRatio;
            this._canvas.height = this.height * this.pixelRatio;
            this.paint();
            const hsva = this.model.color.hsva;
            this.paintSelection(hsva.s, hsva.v);
        }
        paint() {
            const hsva = this.model.color.hsva;
            const saturatedColor = new color_1.Color(new color_1.HSVA(hsva.h, 1, 1, 1));
            const ctx = this._canvas.getContext('2d');
            const whiteGradient = ctx.createLinearGradient(0, 0, this._canvas.width, 0);
            whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            whiteGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            const blackGradient = ctx.createLinearGradient(0, 0, 0, this._canvas.height);
            blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
            ctx.rect(0, 0, this._canvas.width, this._canvas.height);
            ctx.fillStyle = color_1.Color.Format.CSS.format(saturatedColor);
            ctx.fill();
            ctx.fillStyle = whiteGradient;
            ctx.fill();
            ctx.fillStyle = blackGradient;
            ctx.fill();
        }
        paintSelection(s, v) {
            this.selection.style.left = `${s * this.width}px`;
            this.selection.style.top = `${this.height - v * this.height}px`;
        }
        onDidChangeColor(color) {
            if (this.monitor && this.monitor.isMonitoring()) {
                return;
            }
            this.paint();
            const hsva = color.hsva;
            this.paintSelection(hsva.s, hsva.v);
        }
    }
    class Strip extends lifecycle_1.Disposable {
        constructor(container, model, showingStandaloneColorPicker = false) {
            super();
            this.model = model;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._onColorFlushed = new event_1.Emitter();
            this.onColorFlushed = this._onColorFlushed.event;
            if (showingStandaloneColorPicker) {
                this.domNode = dom.append(container, $('.standalone-strip'));
                this.overlay = dom.append(this.domNode, $('.standalone-overlay'));
            }
            else {
                this.domNode = dom.append(container, $('.strip'));
                this.overlay = dom.append(this.domNode, $('.overlay'));
            }
            this.slider = dom.append(this.domNode, $('.slider'));
            this.slider.style.top = `0px`;
            this._register(dom.addDisposableListener(this.domNode, dom.EventType.POINTER_DOWN, e => this.onPointerDown(e)));
            this._register(model.onDidChangeColor(this.onDidChangeColor, this));
            this.layout();
        }
        layout() {
            this.height = this.domNode.offsetHeight - this.slider.offsetHeight;
            const value = this.getValue(this.model.color);
            this.updateSliderPosition(value);
        }
        onDidChangeColor(color) {
            const value = this.getValue(color);
            this.updateSliderPosition(value);
        }
        onPointerDown(e) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            const monitor = this._register(new globalPointerMoveMonitor_1.GlobalPointerMoveMonitor());
            const origin = dom.getDomNodePagePosition(this.domNode);
            this.domNode.classList.add('grabbing');
            if (e.target !== this.slider) {
                this.onDidChangeTop(e.offsetY);
            }
            monitor.startMonitoring(e.target, e.pointerId, e.buttons, event => this.onDidChangeTop(event.pageY - origin.top), () => null);
            const pointerUpListener = dom.addDisposableListener(e.target.ownerDocument, dom.EventType.POINTER_UP, () => {
                this._onColorFlushed.fire();
                pointerUpListener.dispose();
                monitor.stopMonitoring(true);
                this.domNode.classList.remove('grabbing');
            }, true);
        }
        onDidChangeTop(top) {
            const value = Math.max(0, Math.min(1, 1 - (top / this.height)));
            this.updateSliderPosition(value);
            this._onDidChange.fire(value);
        }
        updateSliderPosition(value) {
            this.slider.style.top = `${(1 - value) * this.height}px`;
        }
    }
    class OpacityStrip extends Strip {
        constructor(container, model, showingStandaloneColorPicker = false) {
            super(container, model, showingStandaloneColorPicker);
            this.domNode.classList.add('opacity-strip');
            this.onDidChangeColor(this.model.color);
        }
        onDidChangeColor(color) {
            super.onDidChangeColor(color);
            const { r, g, b } = color.rgba;
            const opaque = new color_1.Color(new color_1.RGBA(r, g, b, 1));
            const transparent = new color_1.Color(new color_1.RGBA(r, g, b, 0));
            this.overlay.style.background = `linear-gradient(to bottom, ${opaque} 0%, ${transparent} 100%)`;
        }
        getValue(color) {
            return color.hsva.a;
        }
    }
    class HueStrip extends Strip {
        constructor(container, model, showingStandaloneColorPicker = false) {
            super(container, model, showingStandaloneColorPicker);
            this.domNode.classList.add('hue-strip');
        }
        getValue(color) {
            return 1 - (color.hsva.h / 360);
        }
    }
    class InsertButton extends lifecycle_1.Disposable {
        constructor(container) {
            super();
            this._onClicked = this._register(new event_1.Emitter());
            this.onClicked = this._onClicked.event;
            this._button = dom.append(container, document.createElement('button'));
            this._button.classList.add('insert-button');
            this._button.textContent = 'Insert';
            this._button.onclick = e => {
                this._onClicked.fire();
            };
        }
        get button() {
            return this._button;
        }
    }
    exports.InsertButton = InsertButton;
    class ColorPickerWidget extends widget_1.Widget {
        static { this.ID = 'editor.contrib.colorPickerWidget'; }
        constructor(container, model, pixelRatio, themeService, standaloneColorPicker = false) {
            super();
            this.model = model;
            this.pixelRatio = pixelRatio;
            this._register(browser_1.PixelRatio.onDidChange(() => this.layout()));
            const element = $('.colorpicker-widget');
            container.appendChild(element);
            this.header = this._register(new ColorPickerHeader(element, this.model, themeService, standaloneColorPicker));
            this.body = this._register(new ColorPickerBody(element, this.model, this.pixelRatio, standaloneColorPicker));
        }
        getId() {
            return ColorPickerWidget.ID;
        }
        layout() {
            this.body.layout();
        }
    }
    exports.ColorPickerWidget = ColorPickerWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JQaWNrZXJXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2xvclBpY2tlci9icm93c2VyL2NvbG9yUGlja2VyV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW1CaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixNQUFhLGlCQUFrQixTQUFRLHNCQUFVO1FBU2hELFlBQVksU0FBc0IsRUFBbUIsS0FBdUIsRUFBRSxZQUEyQixFQUFVLCtCQUF3QyxLQUFLO1lBQy9KLEtBQUssRUFBRSxDQUFDO1lBRDRDLFVBQUssR0FBTCxLQUFLLENBQWtCO1lBQXVDLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBaUI7WUFIL0ksaUJBQVksR0FBdUIsSUFBSSxDQUFDO1lBTXhELElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDekMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDdEUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2xHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFD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